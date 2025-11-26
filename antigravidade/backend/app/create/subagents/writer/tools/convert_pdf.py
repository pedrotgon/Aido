import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import textwrap

def convert_to_pdf(text_content: str, output_dir: str, filename: str) -> str:
    """
    Generates a PDF file from text content using ReportLab.
    This is a robust fallback to ensure PDF generation works without MS Word.
    """
    try:
        # Security check
        allowed_output_dir = os.path.abspath("e:\\AI\\aido\\antigravidade\\data\\saida\\pdf")
        output_dir_abs = os.path.abspath(output_dir)
        
        if not os.path.normcase(output_dir_abs).startswith(os.path.normcase(allowed_output_dir)):
             return f"Error: Security - Output directory '{output_dir}' is not allowed."

        os.makedirs(output_dir, exist_ok=True)
        
        pdf_path = os.path.join(output_dir, filename)
        c = canvas.Canvas(pdf_path, pagesize=letter)
        width, height = letter
        
        # Title
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "Aido Generated Manual")
        
        # Content
        c.setFont("Helvetica", 12)
        y_position = height - 80
        margin = 50
        max_width = width - 2 * margin
        
        lines = text_content.split('\n')
        
        for line in lines:
            # Wrap text
            wrapped_lines = textwrap.wrap(line, width=80) # Approx char width
            for wrapped_line in wrapped_lines:
                if y_position < 50:
                    c.showPage()
                    c.setFont("Helvetica", 12)
                    y_position = height - 50
                
                c.drawString(margin, y_position, wrapped_line)
                y_position -= 15
            
            y_position -= 10 # Paragraph spacing
            
        c.save()
        return pdf_path

    except Exception as e:
        return f"Error: {str(e)}"
