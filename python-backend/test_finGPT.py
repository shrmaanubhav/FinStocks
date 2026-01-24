import transformers
import torch

MODEL_PATH = r".\models\models--FinGPT--fingpt-mt_llama3-8b_lora\snapshots\5b5850574ec13e4ce7c102e24f763205992711b7"
pipe = transformers.pipeline(
    "text-generation",
    model=MODEL_PATH,
    device_map="auto",
    dtype=torch.float16,
)

print("FinGPT loaded ✅")

while True:
    query = input("Ask finance AI (0000 to exit): ")

    if query == "0000":
        print("Bye 👋")
        break

    prompt = f"You are a financial analyst. Answer clearly.\nQuestion: {query}\nAnswer:"

    output = pipe(
        prompt,
        max_new_tokens=200,
        temperature=0.6,
        top_p=0.9,
    )

    print("\nAI:", output[0]["generated_text"], "\n")
    print("-" * 60)
