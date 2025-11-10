import { useState } from 'react';
import { postsAPI } from '@/lib/api';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const maxLength = 200;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.length > maxLength) {
      setError(`Content must not exceed ${maxLength} characters`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await postsAPI.create(content);
      setContent('');
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="card p-4 md:p-5">
      {/* Header with icon */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Create a post</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Textarea */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What's on your mind?"
            className={`input resize-none transition-all ${
              isFocused ? 'ring-2 ring-blue-500/20 bg-blue-50/30' : ''
            } ${error ? 'input-error' : ''}`}
            rows={4}
            disabled={loading}
          />
          
          {/* Character counter */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              Max {maxLength} characters
            </span>
            <span
              className={`text-sm font-medium transition-colors ${
                remainingChars < 0
                  ? 'text-red-600'
                  : remainingChars < 20
                  ? 'text-orange-500'
                  : 'text-gray-500'
              }`}
            >
              {remainingChars}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg 
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !content.trim() || content.length > maxLength}
          className="btn btn-primary w-full min-h-[44px] touch-manipulation"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="spinner w-4 h-4"></span>
              <span>Posting...</span>
            </span>
          ) : (
            'Publish Post'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
