from transformers import AutoModel, AutoTokenizer

model_name = 'liuhaotian/llava-v1.6-vicuna-7b'
model = AutoModel.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

input_text = "I am a sentence and I want to be classified."
inputs = tokenizer(input_text, return_tensors="pt")

outputs = model.generate(inputs["input_ids"], max_length=1000)
response = tokenizer.decode(outputs[0])

print(response)