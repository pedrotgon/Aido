"""Test 05: Direct write_docx Test"""
import asyncio
import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.create.subagents.writer.tools.write_docx import write_docx

async def test_write_docx_direct():
    """Test write_docx with valid JSON."""
    
    # Create valid JSON matching template expectations
    test_json = {
        "titulo": "Manual de Segurança - Teste",
        "introducao": "Este é um manual de teste para verificar a geração de DOCX.",
        "capitulos": [
            {
                "titulo": "Capítulo 1: Equipamentos de Proteção",
                "conteudo": "Sempre use capacete, luvas e óculos de proteção."
            },
            {
                "titulo": "Capítulo 2: Procedimentos de Emergência",
                "conteudo": "Em caso de emergência, pressione o botão vermelho de parada."
            }
        ]
    }
    
    json_str = json.dumps(test_json, ensure_ascii=False)
    
    template_path = "E:\\AI\\aido\\antigravidade\\templates\\Padronizacao_Manuais.docx"
    output_dir = "E:\\AI\\aido\\antigravidade\\data\\saida\\docx"
    
    print(f"[TEST 05] Testing write_docx...")
    print(f"[TEST 05] Template exists: {os.path.exists(template_path)}")
    print(f"[TEST 05] Output dir exists: {os.path.exists(output_dir)}")
    print(f"[TEST 05] JSON length: {len(json_str)}")
    
    result = await write_docx(json_str, template_path, output_dir)
    
    print(f"[TEST 05] Result: {result}")
    
    if result["status"] == "success":
        print(f"[TEST 05] PASSED - DOCX created at: {result['output_path']}")
        print(f"[TEST 05] File exists: {os.path.exists(result['output_path'])}")
        return True
    else:
        print(f"[TEST 05] FAILED - Error: {result.get('message')}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_write_docx_direct())
    exit(0 if success else 1)
