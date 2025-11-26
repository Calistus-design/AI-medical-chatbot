# File: app.py

import os
import uvicorn
import pickle
import faiss
import torch
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# --- This part of the code runs ONCE when the server starts up ---
print("--- Server starting up: Loading all models into memory... ---")

# --- 1. Load RAG Components (FAISS Index and Texts) ---
# This path now looks for a local 'data' folder.
data_path = "./data/"
try:
    with open(os.path.join(data_path, "faiss_texts.pkl"), "rb") as f:
        texts = pickle.load(f)
    index = faiss.read_index(os.path.join(data_path, "faiss_index.index"))
    print("✅ RAG components (FAISS index and texts) loaded successfully.")
except FileNotFoundError:
    print("❌ ERROR: FAISS index or texts not found in the './data/' directory.")
    print("Please make sure 'faiss_texts.pkl' and 'faiss_index.index' are present.")
    exit() # Stop the server if data files are missing.

# --- 2. Load the AI Models ---
from sentence_transformers import SentenceTransformer
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"✅ Running on device: {device}")

print("⏳ Loading embedding model (Qwen)...")
embedding_model = SentenceTransformer('Qwen/Qwen3-Embedding-0.6B')
print("✅ Embedding model loaded.")

print("⏳ Loading main LLM (microsoft/MediPhi-Clinical)...")
model_name = "microsoft/MediPhi-Clinical"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    load_in_4bit=True,
    trust_remote_code=True
)
print("✅ Main LLM loaded.")

print("⏳ Loading classifier model (facebook/bart-large-mnli)...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("✅ Classifier loaded.")
print("--- All models loaded. Server is ready. ---")


# --- HELPER FUNCTIONS (Copied and cleaned from your notebook) ---

def query_rag(query: str, top_k: int = 5):
    query_vec = embedding_model.encode([query], convert_to_numpy=True, device=device)
    query_vec = np.array(query_vec, dtype=np.float32).reshape(1, -1)
    D, I = index.search(query_vec, top_k)
    return [texts[i] for i in I[0]]

class ChatMessage(BaseModel): # Moved here to be available for functions
    role: str
    content: str

def generate_answer(query: str, context: list, history: List[ChatMessage], tokens: int = 1000) -> str:
    formatted_history = ""
    for message in history:
        if message.role == 'user':
            formatted_history += f"Previous Question: {message.content}\\n"
        elif message.role == 'assistant':
            formatted_history += f"Your Previous Answer: {message.content}\\n---\\n"
    
    system_prompt = f"""You are a reliable, calm, and knowledgeable medical first aid assistant. You can remember the past conversation.
 
Your job is to give a **complete, step-by-step guide**.
 
Follow these strict rules:
- Use clear, simple, reassuring language.
- Avoid generic bullet lists — instead, structure the response in short sections.
- Highlight urgent actions with **bold** text.
- **If the query describes or implies an emergency / injury / accident / sudden illness / life-threatening scenario → switch 
to FIRST AID MODE.**
 
- **If the query is informational, preventive, or explanatory (e.g., about conditions, symptoms, nutrition, health advice) → 
switch to GENERAL MEDICAL MODE.**
- In case of emergencies, instruct the user to contact their *local* emergency services or visit the nearest medical facility.
- If the retrieved context mentions a specific emergency hotline (e.g., 911, 000, 112), replace it with the phrase 
‘your local emergency number’. In case a country is mentioned do not include it in the reponse.
- Do not mention or speculate about the user's country, location, or local hotlines — use only "your local emergency 
number" when advising to call emergency services.
- All words must be spelled correctly in standard English; do not produce garbled or partial words (e.g., “Immedi000”). If unsure, rewrite the phrase normally.
- If a protocol (like FAST or DRSABCD) appears, **expand and explain each letter.**
 
 
### FIRST AID MODE (for emergencies)
 
**Format:**
 
**Situation:** short summary of the problem  
Start with a calm reassurance: “Stay calm — quick action can make a big difference.”  
 
Then follow this exact structure:
 
1. **Immediate Actions** — 3–6 numbered steps showing exactly what to do first  
2. **Rationale** — one short paragraph explaining *why* those steps matter  
3. **What NOT to do** — 2–4 clear things to avoid  
4. **🚨 When to Seek Immediate Help** — short list of red-flag signs then append `<END>` and nothing after it

 
**Rules:**
- Highlight urgent actions with **bold**.  
- Always replace emergency numbers with “your local emergency number”.  
- If a first aid protocol (like DRSABCD or FAST) appears, **expand and explain each step clearly**.
 
---
 
### GENERAL MEDICAL MODE (for non-emergencies)
 
**Format:**
 
Then use this structure:
1. **Overview** — simple explanation of the concept or condition  
2. **Causes / Mechanism** — brief summary of underlying reason(s)  
3. **Common Symptoms or Signs** — bullet points if relevant  
4. **Management / Prevention** — clear, general guidance (no prescription-only details)  
5. **When to See a Doctor** — short note for red flags then append `<END>` and nothing after it. 

---

### Chat History:
{formatted_history}

### Context for the new question:
{context}

### Current Question:
{query}

Now provide your single response below:
"""

    inputs = tokenizer(system_prompt, return_tensors="pt").to(model.device)
    output = model.generate(
        **inputs,
        max_new_tokens=tokens,
        temperature=0.4,
        top_p=0.9,
        do_sample=False,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.eos_token_id,
    )
    text = tokenizer.decode(output[0], skip_special_tokens=True)
    response = text.split("Now provide your single response below:")[-1]
    response = response.split("<END>")[0].strip()
    return response

def classify_intent_advanced(query: str, history: List[ChatMessage]) -> str:
    query_lower = query.lower().strip()
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    if any(greeting in query_lower for greeting in greetings):
        return "greeting"

    candidate_labels = ["medical first-aid question", "general conversation"]
    result = classifier(query, candidate_labels)
    top_label = result['labels'][0]
    top_score = result['scores'][0]
    
    if top_label == "medical first-aid question" and top_score > 0.55:
        print(f"🧠 Intent classified as MEDICAL ({top_score:.2f})")
        return "medical"
    else:
        print(f"🧠 Intent classified as OFF_TOPIC ({top_score:.2f})")
        return "off_topic"

def classify_response_seriousness(response_text: str) -> bool:
    candidate_labels = ["urgent medical emergency", "minor first-aid advice"]
    result = classifier(response_text, candidate_labels)
    top_label = result['labels'][0]
    top_score = result['scores'][0]
    print(f"⚕️ Seriousness check → {top_label} ({top_score:.2f})")
    return top_label == "urgent medical emergency" and top_score > 0.6


# --- FASTAPI SERVER LOGIC ---

app = FastAPI()

class QueryRequest(BaseModel):
    query: str
    history: List[ChatMessage] = []

class QueryResponse(BaseModel):
    answer: str
    show_hospital_modal: bool

@app.get("/") # Add a root endpoint for health checks
def read_root():
    return {"status": "ok"}

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    query = request.query
    history = request.history
    print(f"Received query: '{query}'")

    intent = classify_intent_advanced(query, history)
    print(f"Classified intent as: {intent}")

    try:
        if intent == "greeting":
            answer = "Hello! I am a first aid assistant. How can I help you with your medical situation today?"
            return QueryResponse(answer=answer, show_hospital_modal=False)

        elif intent == "off_topic":
            answer = "I apologize, but I am a specialized medical first aid assistant. I cannot provide information on topics outside of that scope."
            return QueryResponse(answer=answer, show_hospital_modal=False)
            
        elif intent == "medical":
            context = query_rag(query)
            answer_text = generate_answer(query, context, history)
            is_serious = classify_response_seriousness(answer_text)
            return QueryResponse(answer=answer_text, show_hospital_modal=is_serious)

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))