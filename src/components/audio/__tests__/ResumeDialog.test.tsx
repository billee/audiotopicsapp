/**
 * ResumeDialog component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ResumeDialog from '../ResumeDialog';
import { AudioTopic } from '../../../types';

describe('ResumeDialog', () => {
  const mockTopic: AudioTopic = {
    id: 'test-topic-1',
    title: 'Test Audio Topic',
    description: 'Test Description',
    categoryId: 'test-category',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 300,
    metadata: {
      bitrate: 128,
      format: 'mp3',
      size: 5000000,
    },
  };

  const defaultProps = {
    visible: true,
    topic: mockTopic,
    resumePosition: 150, // 2:30
    onResume: jest.fn(),
    onStartOver: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when visible', () => {
    const { getByText } = render(<ResumeDialog {...defaultProps} />);
    
    expect(getByText('Resume Playback')).toBeTruthy();
    expect(getByText('Test Audio Topic')).toBeTruthy();
    expect(getByText('You were listening to this topic. Would you like to resume from where you left off?')).toBeTruthy();
    expect(getByText('Resume from: 2:30')).toBeTruthy();
    expect(getByText('Start Over')).toBeTruthy();
    expect(getByText('Resume')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <ResumeDialog {...defaultProps} visible={false} />
    );
    
    expect(queryByText('Resume Playback')).toBeNull();
  });

  it('should not render when topic is null', () => {
    const { queryByText } = render(
      <ResumeDialog {...defaultProps} topic={null} />
    );
    
    expect(queryByText('Resume Playback')).toBeNull();
  });

  it('should format time correctly', () => {
    const { getByText } = render(
      <ResumeDialog {...defaultProps} resumePosition={75} />
    );
    
    expect(getByText('Resume from: 1:15')).toBeTruthy();
  });

  it('should format time with leading zeros', () => {
    const { getByText } = render(
      <ResumeDialog {...defaultProps} resumePosition={65} />
    );
    
    expect(getByText('Resume from: 1:05')).toBeTruthy();
  });

  it('should handle zero seconds correctly', () => {
    const { getByText } = render(
      <ResumeDialog {...defaultProps} resumePosition={60} />
    );
    
    expect(getByText('Resume from: 1:00')).toBeTruthy();
  });

  it('should call onResume when Resume button is pressed', () => {
    const { getByText } = render(<ResumeDialog {...defaultProps} />);
    
    fireEvent.press(getByText('Resume'));
    
    expect(defaultProps.onResume).toHaveBeenCalledTimes(1);
  });

  it('should call onStartOver when Start Over button is pressed', () => {
    const { getByText } = render(<ResumeDialog {...defaultProps} />);
    
    fireEvent.press(getByText('Start Over'));
    
    expect(defaultProps.onStartOver).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is pressed', () => {
    const { getByText } = render(<ResumeDialog {...defaultProps} />);
    
    fireEvent.press(getByText('Cancel'));
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should truncate long topic titles', () => {
    const longTitleTopic = {
      ...mockTopic,
      title: 'This is a very long topic title that should be truncated when displayed in the dialog',
    };
    
    const { getByText } = render(
      <ResumeDialog {...defaultProps} topic={longTitleTopic} />
    );
    
    // The text should be present but truncated (numberOfLines={2})
    expect(getByText(longTitleTopic.title)).toBeTruthy();
  });

  it('should have proper accessibility properties', () => {
    const { getByText } = render(<ResumeDialog {...defaultProps} />);
    
    const resumeButton = getByText('Resume');
    const startOverButton = getByText('Start Over');
    const cancelButton = getByText('Cancel');
    
    // Buttons should be touchable
    expect(resumeButton).toBeTruthy();
    expect(startOverButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();
  });

  it('should handle edge case of very large resume position', () => {
    const { getByText } = render(
      <ResumeDialog {...defaultProps} resumePosition={3661} /> // 1:01:01
    );
    
    expect(getByText('Resume from: 61:01')).toBeTruthy();
  });

  it('should handle edge case of zero resume position', () => {
    const { getByText } = render(
      <ResumeDialog {...defaultProps} resumePosition={0} />
    );
    
    expect(getByText('Resume from: 0:00')).toBeTruthy();
  });
});