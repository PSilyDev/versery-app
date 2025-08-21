// src/hooks/useInteractions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';

const fetchInteractions = async () => {
  const { data } = await apiClient.get('/me/interactions');
  return data;
};

const createInteraction = (interaction) => {
  return apiClient.post('/interactions', interaction);
};

const deleteInteraction = (interaction) => {
  return apiClient.delete('/interactions', { data: interaction });
};

export const useInteractions = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['interactions', currentUser?.uid];

  const { data: interactions, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: fetchInteractions,
    enabled: !!currentUser,
  });

  const addMutation = useMutation({
    mutationFn: createInteraction,
    // --- THIS IS THE OPTIMISTIC UPDATE LOGIC ---
    onMutate: async (newInteraction) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKey });

      // 2. Snapshot the previous value
      const previousInteractions = queryClient.getQueryData(queryKey);

      // 3. Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old) => [...(old || []), newInteraction]);

      // 4. Return a context object with the snapshotted value
      return { previousInteractions };
    },
    // If the mutation fails, use the context we returned to roll back
    onError: (err, newInteraction, context) => {
      queryClient.setQueryData(queryKey, context.previousInteractions);
    },
    // Always refetch after the mutation is settled (either success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: deleteInteraction,
    // --- OPTIMISTIC UPDATE FOR REMOVING ---
    onMutate: async (interactionToRemove) => {
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousInteractions = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) =>
        (old || []).filter(
          (i) => !(i.poemId === interactionToRemove.poemId && i.interactionType === interactionToRemove.interactionType)
        )
      );
      return { previousInteractions };
    },
    onError: (err, newInteraction, context) => {
      queryClient.setQueryData(queryKey, context.previousInteractions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const likes = interactions?.filter(i => i.interactionType === 'like').map(i => i.poemId) || [];
  const bookmarks = interactions?.filter(i => i.interactionType === 'bookmark').map(i => i.poemId) || [];

  return {
    likes,
    bookmarks,
    isLoading,
    addInteraction: addMutation.mutate,
    removeInteraction: removeMutation.mutate,
  };
};