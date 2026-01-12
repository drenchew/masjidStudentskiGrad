import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchQuestions();
  }, [filter, navigate]);

  const fetchQuestions = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      setLoading(true);
      let url = '/api/admin/questions';
      
      if (filter === 'unanswered') url += '/unanswered';
      else if (filter === 'answered') url += '/answered';
      else if (filter === 'hidden') url += '/hidden';

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = async (question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answerText || '');
    setIsVisible(question.isVisible ?? true);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token || !selectedQuestion) return;

    setSubmitting(true);

    try {
      const endpoint = selectedQuestion.isAnswered
        ? `/api/admin/questions/${selectedQuestion.id}/answer`
        : `/api/admin/questions/${selectedQuestion.id}/answer`;
      
      const method = selectedQuestion.isAnswered ? 'put' : 'post';

      await axios[method](
        endpoint,
        { answerText, isVisible },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedQuestion(null);
      setAnswerText('');
      setIsVisible(true);
      fetchQuestions();
      alert('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHideQuestion = async (id) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      await axios.patch(
        `/api/admin/questions/${id}/hide`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
    } catch (error) {
      console.error('Error hiding question:', error);
      alert('Failed to hide question');
    }
  };

  const handleUnhideQuestion = async (id) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      await axios.patch(
        `/api/admin/questions/${id}/unhide`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
    } catch (error) {
      console.error('Error unhiding question:', error);
      alert('Failed to unhide question');
    }
  };

  const handleToggleVisibility = async (id) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      await axios.patch(
        `/api/admin/questions/${id}/toggle-visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to toggle visibility');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      await axios.delete(`/api/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions();
      alert('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
            <p className="text-gray-600 mt-2">Review and answer questions from users</p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-medium ${
                filter === 'all'
                  ? 'text-masjid-green border-b-2 border-masjid-green'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Questions
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={`px-6 py-3 font-medium ${
                filter === 'unanswered'
                  ? 'text-masjid-green border-b-2 border-masjid-green'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unanswered
            </button>
            <button
              onClick={() => setFilter('answered')}
              className={`px-6 py-3 font-medium ${
                filter === 'answered'
                  ? 'text-masjid-green border-b-2 border-masjid-green'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Answered
            </button>
            <button
              onClick={() => setFilter('hidden')}
              className={`px-6 py-3 font-medium ${
                filter === 'hidden'
                  ? 'text-masjid-green border-b-2 border-masjid-green'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hidden
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-masjid-green"></div>
            </div>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions found in this category.</p>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          question.isAnswered
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {question.isAnswered ? 'Answered' : 'Pending'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          question.isVisible
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {question.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                        {question.isHidden && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{question.questionText}</p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(question.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Answer Section */}
                  {question.isAnswered && question.answerText && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Your Answer:</p>
                      <p className="text-gray-700">{question.answerText}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Answered: {new Date(question.answeredAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAnswerQuestion(question)}
                      className="px-4 py-2 bg-masjid-green text-white rounded hover:bg-green-700 transition text-sm"
                    >
                      {question.isAnswered ? 'Edit Answer' : 'Answer'}
                    </button>
                    
                    {question.isHidden ? (
                      <button
                        onClick={() => handleUnhideQuestion(question.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      >
                        Unhide
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHideQuestion(question.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                      >
                        Hide
                      </button>
                    )}
                    
                    {question.isAnswered && (
                      <button
                        onClick={() => handleToggleVisibility(question.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                      >
                        {question.isVisible ? 'Make Private' : 'Make Public'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Answer Modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedQuestion.isAnswered ? 'Edit Answer' : 'Answer Question'}
                </h2>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Question:</p>
                  <p className="text-gray-900">{selectedQuestion.questionText}</p>
                </div>

                <form onSubmit={handleSubmitAnswer}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Your Answer
                    </label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-masjid-green focus:border-transparent"
                      rows="6"
                      required
                      placeholder="Type your answer here..."
                    />
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => setIsVisible(e.target.checked)}
                        className="mr-2 h-5 w-5 text-masjid-green focus:ring-masjid-green border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Make this answer visible to the public</span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-masjid-green text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuestion(null);
                        setAnswerText('');
                        setIsVisible(true);
                      }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
