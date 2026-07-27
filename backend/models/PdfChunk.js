const mongoose = require('mongoose');

const pdfChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PdfDocument',
    required: true,
    index: true,
  },
  userId: { type: String, required: true, index: true },
  chunkIndex: { type: Number, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PdfChunk', pdfChunkSchema);
