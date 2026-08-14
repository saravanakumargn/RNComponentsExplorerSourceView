import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  EnrichedMarkdownText,
  type LinkPressEvent,
  type TaskListItemPressEvent,
} from 'react-native-enriched-markdown';
import { sampleMarkdown } from '../../sampleMarkdown';
import { customMarkdownStyle } from '../../markdownStyles';

export default function TextScreen() {
  const markdownStyle = useMemo(() => customMarkdownStyle, []);
  const [taskItemsInteractive, setTaskItemsInteractive] = useState(true);
  const [lastTaskEvent, setLastTaskEvent] =
    useState<TaskListItemPressEvent | null>(null);

  const contextMenuItems = useMemo(
    () => [
      {
        text: 'Summarize with AI',
        icon: Platform.OS === 'ios' ? 'sparkles' : undefined,
        onPress: ({ text }: { text: string }) => {
          Alert.alert('✦ Summarize with AI', `"${text}"`, [
            { text: 'Dismiss', style: 'cancel' },
          ]);
        },
      },
      {
        text: 'Translate',
        icon: Platform.OS === 'ios' ? 'globe' : undefined,
        onPress: ({ text }: { text: string }) => {
          Alert.alert('Translate', `"${text}"`, [
            { text: 'Dismiss', style: 'cancel' },
          ]);
        },
      },
    ],
    []
  );

  const handleLinkPress = (event: LinkPressEvent) => {
    const { url } = event;
    Alert.alert('Link Pressed!', `You tapped on: ${url}`, [
      {
        text: 'Open in Browser',
        onPress: () => {
          Linking.openURL(url);
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const setTaskMode = (interactive: boolean) => {
    setTaskItemsInteractive(interactive);
    setLastTaskEvent(null);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      testID="text-screen"
    >
      <View style={styles.controls} testID="task-toggle-controls">
        <Text style={styles.controlsLabel}>Task checkboxes</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, taskItemsInteractive && styles.buttonActive]}
            onPress={() => setTaskMode(true)}
            testID="task-toggle-interactive"
          >
            <Text
              style={[
                styles.buttonText,
                taskItemsInteractive && styles.buttonTextActive,
              ]}
            >
              Interactive
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !taskItemsInteractive && styles.buttonActive]}
            onPress={() => setTaskMode(false)}
            testID="task-toggle-readonly"
          >
            <Text
              style={[
                styles.buttonText,
                !taskItemsInteractive && styles.buttonTextActive,
              ]}
            >
              Read-only
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.controlsHint} testID="task-toggle-status">
          {lastTaskEvent
            ? `“${lastTaskEvent.text}” → ${
                lastTaskEvent.checked ? 'checked' : 'unchecked'
              }`
            : taskItemsInteractive
              ? 'Tap a checkbox in the Action Checklist below.'
              : 'Taps are inert — no toggle, no onTaskListItemPress.'}
        </Text>
      </View>

      <EnrichedMarkdownText
        flavor="github"
        markdown={sampleMarkdown}
        onLinkPress={handleLinkPress}
        markdownStyle={markdownStyle}
        contextMenuItems={contextMenuItems}
        selectionColor={Platform.OS === 'ios' ? '#5A52FA' : '#DCDDFE'}
        selectionHandleColor="#5A52FA"
        enableTaskListItemToggle={taskItemsInteractive}
        onTaskListItemPress={setLastTaskEvent}
        md4cFlags={{
          superscript: true,
          subscript: true,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 16,
  },
  controls: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    padding: 12,
    marginBottom: 16,
  },
  controlsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#BEEBD0',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  buttonTextActive: {
    color: '#001A72',
  },
  controlsHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
});
