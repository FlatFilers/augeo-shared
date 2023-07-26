import api from '@flatfile/api';

/**
 * Retrieves the user ID from the Flatfile space metadata.
 *
 * @param {Object} params - The function parameters.
 * @param {string} params.spaceId - The space ID.
 * @returns {string} The user ID.
 */
export const getUserIdFromSpace = async (spaceId) => {
  console.log('| fetching space: ' + spaceId);

  const space = await api.spaces.get(spaceId);

  console.log('| space: ' + JSON.stringify(space));

  // TODO: Eventually remove. Embed nests userId under spaceInfo
  const userId =
    space.data.metadata.userId || space.data.metadata.spaceInfo.userId;

  console.log('| userId: ' + userId);

  return userId;
};
