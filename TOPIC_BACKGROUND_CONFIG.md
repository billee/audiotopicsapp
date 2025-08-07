# Topic Background Configuration Guide

## How to Add/Modify Topic Backgrounds

The background images are now configurable through an array in `src/assets/backgrounds/index.ts`.

### Current Configuration Location:
**File:** `src/assets/backgrounds/index.ts`  
**Array:** `topicAudioPlayerBackgrounds`

### Adding a New Topic Background:

```typescript
{
    topicId: 'your-topic-id', // Replace with actual topic ID
    categoryId: '2', // Category: 1=tech, 2=science, 3=history, 4=arts, 5=business, 6=health
    title: 'Your Topic Title',
    background: {
        local: require('./topic-list/your-image.png'), // Path to your image
        remote: null, // Set to URL if you want remote fallback
        description: 'Description of your background'
    }
}
```

### Example Configurations:

```typescript
export const topicAudioPlayerBackgrounds = [
    // Science Topics
    {
        topicId: 'climate-crisis-1',
        categoryId: '2',
        title: 'Climate Crisis Topic',
        background: {
            local: require('./topic-list/health.png'),
            remote: null,
            description: 'Health professional background for climate science'
        }
    },
    {
        topicId: 'biology-basics-1',
        categoryId: '2', 
        title: 'Biology Basics',
        background: {
            local: require('./topic-list/science.jpg'),
            remote: null,
            description: 'Science lab background for biology'
        }
    },
    // Technology Topics
    {
        topicId: 'ai-future-1',
        categoryId: '1',
        title: 'AI and the Future',
        background: {
            local: require('./topic-list/technology.png'),
            remote: null,
            description: 'Technology background for AI topics'
        }
    }
];
```

### Available Background Images:
- `./topic-list/health.png` ✅ Working
- `./topic-list/technology.png` ✅ Working  
- `./topic-list/arts.jpg` ✅ Working
- `./topic-list/business.jpg` ✅ Working
- `./topic-list/history.jpg` ✅ Working
- `./topic-list/default.jpg` ✅ Working
- `./topic-list/science.jpg` ❌ Corrupted (use health.png instead)

### Category IDs:
- `'1'` = Technology
- `'2'` = Science  
- `'3'` = History
- `'4'` = Arts
- `'5'` = Business
- `'6'` = Health

### How It Works:
1. **Topic-Specific**: If a topic ID matches, uses that specific background
2. **Category Fallback**: If no topic match, uses category default
3. **Global Fallback**: If no category match, uses global default

### Helper Functions Available:
```typescript
// Get all backgrounds for a category
getTopicBackgroundsByCategory('2'); // Get all science backgrounds

// Get specific topic background info
getTopicBackgroundInfo('topic-id');
```

**Note:** Due to React Native limitations, you cannot add backgrounds programmatically with dynamic require(). All backgrounds must be added directly to the `topicAudioPlayerBackgrounds` array.

### To Modify:
1. Open `src/assets/backgrounds/index.ts`
2. Find the `topicAudioPlayerBackgrounds` array
3. Add/modify entries as needed
4. Save the file - changes take effect immediately!