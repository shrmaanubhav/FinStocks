import transformers
import torch

MODEL_PATH = r"C:\Users\Azeem\Desktop\BitWise\python-backend\models\models--WiroAI--WiroAI-Finance-Qwen-7B\snapshots\2e994e9a65cce73b38aeb82fcaa73c047cbb159b"

def load_finance_pipeline():
    pipe = transformers.pipeline(
        "text-generation",
        model=MODEL_PATH,
        model_kwargs={"torch_dtype": torch.bfloat16},
        device_map="auto",
    )
    pipe.model.eval()
    return pipe

finance_pipe = load_finance_pipeline()

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
        max_new_tokens=512,
        eos_token_id=terminators,
        do_sample=True,
        temperature=0.7,
    )

    return outputs[0]["generated_text"][-1]["content"]


print(ask_finance("Is Tesla stock overvalued?"))
