from docxtpl import DocxTemplate
import os

class DocumentGenerator:
    def generate(self, context: dict, template_path: str, output_path: str):
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Template not found at {template_path}")
            
        doc = DocxTemplate(template_path)
        doc.render(context)
        doc.save(output_path)
