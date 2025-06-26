import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Loader2, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Comment {
  _id: string;
  userId: string;
  username: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  text: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentsProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
}

const Comments: React.FC<CommentsProps> = ({ tmdbId, mediaType, title }) => {
  const { isAuthenticated, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [lastFetchKey, setLastFetchKey] = useState<string>('');

  // Função memoizada para buscar comentários
  const fetchComments = useCallback(async () => {
    const fetchKey = `${mediaType}-${tmdbId}`;
    
    // Evitar requisições duplicadas
    if (lastFetchKey === fetchKey && comments.length > 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments?mediaType=${mediaType}&tmdbId=${tmdbId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const commentsData: Comment[] = await response.json();
        setComments(commentsData);
        setLastFetchKey(fetchKey);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao carregar comentários');
      }
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      setError('Erro de conexão ao carregar comentários');
    } finally {
      setIsLoading(false);
    }
  }, [tmdbId, mediaType, lastFetchKey, comments.length]);

  // Buscar comentários apenas quando tmdbId ou mediaType mudarem
  useEffect(() => {
    if (tmdbId && mediaType) {
      fetchComments();
    }
  }, [tmdbId, mediaType, fetchComments]);

  // Enviar novo comentário
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      setError('Você precisa estar logado para comentar');
      return;
    }

    if (!newComment.trim()) {
      setError('O comentário não pode estar vazio');
      return;
    }

    if (newComment.length > 500) {
      setError('O comentário deve ter no máximo 500 caracteres');
      return;
    }

    // Evitar envio duplicado
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          text: newComment.trim(),
        }),
      });

      if (response.ok) {
        const newCommentData: Comment = await response.json();
        setComments(prevComments => [newCommentData, ...prevComments]);
        setNewComment('');
        setSubmitFeedback('Comentário enviado com sucesso!');
        setTimeout(() => setSubmitFeedback(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao enviar comentário');
      }
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
      setError('Erro de conexão ao enviar comentário');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInHours < 168) { // 7 dias
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="bg-[#2a2626] rounded-lg p-4 md:p-6 mt-8">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-6 h-6 text-red-500 mr-3" />
        <h2 className="text-xl md:text-2xl font-bold text-white">
          Comentários ({comments.length})
        </h2>
      </div>

      {/* Formulário para novo comentário */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Compartilhe sua opinião sobre "${title}"...`}
              className="w-full p-3 bg-[#1E1A1A] text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none resize-none transition-colors"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {newComment.length}/500 caracteres
              </span>
              {error && (
                <span className="text-xs text-red-400">{error}</span>
              )}
              {submitFeedback && (
                <span className="text-xs text-green-400">{submitFeedback}</span>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Enviando...' : 'Enviar Comentário'}</span>
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-[#1E1A1A] rounded-lg border border-gray-600">
          <p className="text-gray-300 text-center">
            <a 
              href="/login" 
              className="text-red-500 hover:text-red-400 underline"
            >
              Faça login
            </a>{' '}
            para deixar um comentário sobre esta produção.
          </p>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : error && comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-gray-400 text-sm">
              Não foi possível carregar os comentários.
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-lg mb-2">
              Seja o primeiro a comentar!
            </p>
            <p className="text-gray-500 text-sm">
              Compartilhe sua opinião sobre esta produção.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-[#1E1A1A] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-white text-sm">
                      {comment.username}
                    </h4>
                    <div className="flex items-center text-gray-400 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rodapé informativo */}
      {comments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-gray-500 text-xs text-center">
            Os comentários refletem as opiniões dos usuários e não representam a visão da plataforma.
          </p>
        </div>
      )}
    </div>
  );
};

export default Comments;
