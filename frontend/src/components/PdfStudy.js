import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../api';

export default function PdfStudy({ userToken, onSummaryCreated }) {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDocuments = useCallback(async () => {
    if (!userToken) return;

    try {
      const response = await fetch(apiUrl('/api/pdf-documents'), {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PDF 목록을 불러오지 못했습니다.');
      }

      setDocuments(data.documents || []);
    } catch (fetchError) {
      setError(fetchError.message);
    }
  }, [userToken]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || !userToken) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(apiUrl('/api/pdf-documents'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PDF 요약 생성에 실패했습니다.');
      }

      setFile(null);
      setSelectedDocument(data.document);
      await fetchDocuments();
      onSummaryCreated?.();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async (event) => {
    event.preventDefault();
    if (!selectedDocument || !question.trim()) return;

    setQuestionLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch(
        apiUrl(`/api/pdf-documents/${selectedDocument._id}/questions`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ question }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '질문 답변 생성에 실패했습니다.');
      }

      setAnswer(data.answer);
    } catch (questionError) {
      setError(questionError.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  if (!userToken) return null;

  return (
    <section className="w-[1200px] mt-12 border border-slate-200 rounded-lg p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold">PDF 학습자료</h2>
          <p className="text-sm text-slate-500 mt-1">
            PDF를 업로드하면 한국어 요약과 자료 기반 질문 답변을 만들 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleUpload} className="flex items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-[#1B3764] text-white px-4 py-2 rounded disabled:bg-slate-300"
          >
            {loading ? '요약 중...' : '업로드'}
          </button>
        </form>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-[320px_1fr] gap-6 mt-6">
        <div className="border border-slate-200 rounded p-3 min-h-[220px]">
          <h3 className="font-semibold mb-3">업로드한 PDF</h3>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">아직 업로드한 PDF가 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map((document) => (
                <button
                  key={document._id}
                  type="button"
                  onClick={() => {
                    setSelectedDocument(document);
                    setAnswer('');
                  }}
                  className={`text-left border rounded p-3 ${
                    selectedDocument?._id === document._id
                      ? 'border-[#1B3764] bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-sm line-clamp-2">
                    {document.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {document.chunkCount}개 청크
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded p-4 min-h-[220px]">
          {selectedDocument ? (
            <>
              <h3 className="font-bold">{selectedDocument.title}</h3>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 mt-3 max-h-[260px] overflow-auto">
                {selectedDocument.summary}
              </pre>

              <form onSubmit={handleQuestion} className="flex gap-2 mt-5">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="PDF 내용에 대해 질문해보세요"
                  className="flex-1 border border-slate-300 rounded px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={questionLoading}
                  className="bg-yellow-400 px-4 py-2 rounded disabled:bg-slate-300"
                >
                  {questionLoading ? '답변 중...' : '질문'}
                </button>
              </form>

              {answer && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-4 text-sm whitespace-pre-wrap">
                  {answer}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">
              왼쪽에서 PDF를 선택하면 요약과 질문 기능을 사용할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
