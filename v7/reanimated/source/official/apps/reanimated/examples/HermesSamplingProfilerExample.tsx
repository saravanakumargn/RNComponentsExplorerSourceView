import { Button, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { scheduleOnUI } from 'react-native-worklets';

declare global {
  var _startProfiling: (meanHzFreq?: number) => void;
  var _stopProfiling: () => string;
}

const RN_RUNTIME_MEAN_HZ_FREQ = 100;
const UI_RUNTIME_MEAN_HZ_FREQ = 1200;

// `_startProfiling`/`_stopProfiling` are Hermes globals injected only in builds with the
// sampling profiler enabled. On a standard build (e.g. a plain simulator build) they're
// undefined, so calling them directly throws a "not a function" TypeError on tap.
const isSamplingProfilerAvailable =
  typeof globalThis._startProfiling === 'function' && typeof globalThis._stopProfiling === 'function';

export default function HermesSamplingProfilerExample() {
  const [isProfilingRN, setIsProfilingRN] = useState(false);
  const [isProfilingUI, setIsProfilingUI] = useState(false);

  const handleStartRNProfiling = () => {
    if (isProfilingRN || !isSamplingProfilerAvailable) return;
    setIsProfilingRN(true);
    globalThis._startProfiling(RN_RUNTIME_MEAN_HZ_FREQ);
  };

  const handleStopRNProfiling = () => {
    if (!isProfilingRN || !isSamplingProfilerAvailable) return;
    setIsProfilingRN(false);
    const path = globalThis._stopProfiling();
    console.log(path);
  };

  const handleStartUIProfiling = () => {
    if (isProfilingUI || !isSamplingProfilerAvailable) return;
    setIsProfilingUI(true);
    scheduleOnUI(() => {
      globalThis._startProfiling(UI_RUNTIME_MEAN_HZ_FREQ);
    });
  };

  const handleStopUIProfiling = () => {
    if (!isProfilingUI || !isSamplingProfilerAvailable) return;
    setIsProfilingUI(false);
    scheduleOnUI(() => {
      const path = globalThis._stopProfiling();
      console.log(path);
    });
  };

  useEffect(() => {
    const id = setInterval(function sleepOnJSThread() {
      const start = performance.now();
      while (performance.now() - start < 100) {
        // do nothing
      }
    }, 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      scheduleOnUI(function sleepOnUIThread() {
        const start = performance.now();
        while (performance.now() - start < 100) {
          // do nothing
        }
      });
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      {!isSamplingProfilerAvailable && (
        <Text style={styles.unavailableNotice}>
          The Hermes sampling profiler isn't available in this build, so these controls are
          disabled.
        </Text>
      )}
      <Button
        title="Start RN runtime profiling"
        onPress={handleStartRNProfiling}
        disabled={isProfilingRN || !isSamplingProfilerAvailable}
      />
      <Button
        title="Stop RN runtime profiling"
        onPress={handleStopRNProfiling}
        disabled={!isProfilingRN || !isSamplingProfilerAvailable}
      />
      <Button
        title="Start UI runtime profiling"
        onPress={handleStartUIProfiling}
        disabled={isProfilingUI || !isSamplingProfilerAvailable}
      />
      <Button
        title="Stop UI runtime profiling"
        onPress={handleStopUIProfiling}
        disabled={!isProfilingUI || !isSamplingProfilerAvailable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  unavailableNotice: {
    marginHorizontal: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#888',
  },
});
