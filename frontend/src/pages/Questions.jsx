import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';

export default function Questions() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setMessage({ type: 'error', text: 'Failed to load questions' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) {
      setMessage({ type: 'error', text: t('questions.emptyQuestion') || 'Please enter a question' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/questions', { questionText: newQuestion });
      setMessage({ 
        type: 'success', 
        text: t('questions.submitSuccess') || 'Your question has been submitted successfully. It will be answered soon!' 
      });
      setNewQuestion('');
      // Refresh questions after submission
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      setMessage({ 
        type: 'error', 
        text: t('questions.submitError') || 'Failed to submit question. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('questions.title') || 'Ask Questions Anonymously'}
          </h1>
          <p className="text-lg text-gray-600">
            {t('questions.description') || 'Submit your questions anonymously and get answers from our scholars'}
          </p>
        </div>

        {/* Submit Question Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('questions.askQuestion') || 'Ask a Question'}
          </h2>
          <form onSubmit={handleSubmitQuestion}>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder={t('questions.placeholder') || 'Type your question here...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green focus:border-transparent"
              rows="5"
              disabled={submitting}
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {t('questions.anonymous') || '✓ Your question will be submitted anonymously'}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-masjid-green text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (t('questions.submitting') || 'Submitting...') : (t('questions.submit') || 'Submit Question')}
              </button>
            </div>
          </form>

          {/* Message Display */}
          {message.text && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Previously Answered Questions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('questions.previousQuestions') || 'Previously Answered Questions'}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-masjid-green"></div>
            </div>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t('questions.noQuestions') || 'No questions have been answered yet.'}
            </p>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="mb-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 bg-masjid-green rounded-full flex items-center justify-center text-white">
                          Q
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="text-gray-900 font-medium">{question.questionText}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {question.answerText && (
                    <div className="ml-13 mt-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                            A
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{question.answerText}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {t('questions.answeredOn') || 'Answered on'} {new Date(question.answeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
