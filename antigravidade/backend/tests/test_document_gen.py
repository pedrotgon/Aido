import pytest
from unittest.mock import MagicMock, patch
from app.services.document_gen import DocumentGenerator

@pytest.fixture
def mock_docxtpl():
    with patch("app.services.document_gen.DocxTemplate") as mock:
        yield mock

def test_generate_document_success(mock_docxtpl):
    template_mock = mock_docxtpl.return_value
    
    generator = DocumentGenerator()
    context = {"title": "Test Manual", "content": "This is a test."}
    output_path = "output.docx"
    
    generator.generate(context, "template.docx", output_path)
    
    template_mock.render.assert_called_once_with(context)
    template_mock.save.assert_called_once_with(output_path)

def test_generate_document_missing_template(mock_docxtpl):
    mock_docxtpl.side_effect = FileNotFoundError("Template not found")
    
    generator = DocumentGenerator()
    
    with pytest.raises(FileNotFoundError):
        generator.generate({}, "missing.docx", "out.docx")
