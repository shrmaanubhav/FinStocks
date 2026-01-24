import transformers
import torch
from transformers import BitsAndBytesConfig

MODEL_PATH = r"C:\Users\Azeem\Desktop\BitWise\python-backend\models\models--WiroAI--WiroAI-Finance-Qwen-7B\snapshots\2e994e9a65cce73b38aeb82fcaa73c047cbb159b"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
)

def load_finance_pipeline():
    pipe = transformers.pipeline(
        "text-generation",
        model=MODEL_PATH,
        quantization_config=bnb_config,
        device_map="cuda",   # force GPU
    )
    pipe.model.eval()
    return pipe

print("🚀 Loading Qwen-7B in 4-bit mode...")
finance_pipe = load_finance_pipeline()
print("⚡ Model Loaded FAST!\n")


def ask_finance(query: str):
    messages = [
        {"role": "system", "content": "You are a finance chatbot developed by Wiro AI."},
        {"role": "user", "content": query},
    ]

    terminators = [
        finance_pipe.tokenizer.eos_token_id,
        finance_pipe.tokenizer.convert_tokens_to_ids("<｜end▁of▁sentence｜>")
    ]

    outputs = finance_pipe(
        messages,
        eos_token_id=terminators,
        do_sample=True,
        max_new_tokens=200,
        temperature=0.6,
        top_p=0.9

    )

    return outputs[0]["generated_text"][-1]["content"]

# ✅ Interactive loop
while True:
    user_input = input("🧑‍💻 Ask Finance AI (type 0000 to exit): ")

    if user_input.strip() == "0000":
        print("👋 Exiting Finance AI. Bye!")
        break

    response = ask_finance(user_input)
    print("\n🤖 Finance AI:", response, "\n")
