package com.healthverse.aianalysis.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class PdfExtractionService {

    public String extractTextFromPdf(InputStream inputStream) {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new LayoutTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        } catch (Exception e) {
            return "Unable to extract text from PDF: " + e.getMessage();
        }
    }

    private static class LayoutTextStripper extends PDFTextStripper {
        public LayoutTextStripper() throws IOException {
            super();
        }

        @Override
        protected void writeString(String text, List<TextPosition> textPositions) throws IOException {
            StringBuilder builder = new StringBuilder();
            float lastX = -1;
            for (TextPosition position : textPositions) {
                if (lastX != -1) {
                    float distance = position.getXDirAdj() - lastX;
                    // If distance is significantly larger than a normal space, insert a pipe separator
                    if (distance > position.getWidthOfSpace() * 3.0f) {
                        builder.append(" | ");
                    }
                }
                builder.append(position.getUnicode());
                lastX = position.getXDirAdj() + position.getWidthDirAdj();
            }
            super.writeString(builder.toString(), textPositions);
        }
    }
}
