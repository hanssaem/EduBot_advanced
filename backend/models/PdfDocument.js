const mongoose = require('mongoose');

const pdfDocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  summary: { type: String, required: true },
  textLength: { type: Number, default: 0 },
  chunkCount: { type: Number, default: 0 },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PdfDocument', pdfDocumentSchema);
