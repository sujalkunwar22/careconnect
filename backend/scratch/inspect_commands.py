import json

with open(r'C:\Users\sujal\.gemini\antigravity\brain\bbec2afe-a60f-478f-8373-de1a20875456\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        content = obj.get('content', '')
        if 'delete' in content.lower() or 'clear' in content.lower() or 'remove' in content.lower():
            if 'sqlite' in content.lower() or 'db' in content.lower():
                print(f"=== STEP {obj.get('step_index')} ===")
                print(content[:500])
                print("...\n")
