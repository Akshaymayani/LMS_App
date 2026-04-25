import { AppLoader } from '@/components/app/app-loader';
import { AppText } from '@/components/app/app-text';
import { makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCourseDetailQuery } from '@/hooks/useApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { completeTask, openCourse } from '@/store/slices/progressSlice';
import { showSnackbar } from '@/store/slices/uiSlice';
import { webViewStyles } from '@/styles/webViewStyles';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

export default function CourseWebViewScreen() {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const courseId = Number(rawId);
  const { course, isPending } = useCourseDetailQuery(courseId);
  const styles = webViewStyles();

  useEffect(() => {
    if (!course) {
      return;
    }
    dispatch(
      openCourse({
        courseId: course.id,
        totalTasks: course.lessonCount,
      })
    );
  }, [course?.id, dispatch]);

  const lessonCount = course?.lessonCount ?? 6;

  const injectedJavaScript = useMemo(
    () => `
      window.LMS_NATIVE = ${JSON.stringify({
        courseId,
        token: token ?? '',
      })};
      window.dispatchEvent(new CustomEvent('lms:session', { detail: window.LMS_NATIVE }));
      true;
    `,
    [courseId, token]
  );

  const htmlContent = useMemo(
    () => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            :root {
              color-scheme: dark;
              --bg: #08111d;
              --panel: rgba(18, 33, 52, 0.92);
              --panel-soft: rgba(35, 62, 92, 0.78);
              --accent: #4ab2ff;
              --accent-2: #ff9c61;
              --text: #f6f4ef;
              --muted: #b2bfd0;
              --line: rgba(255, 255, 255, 0.12);
            }

            * {
              box-sizing: border-box;
            }

            body {
              background:
                radial-gradient(circle at top right, rgba(74, 178, 255, 0.16), transparent 28%),
                radial-gradient(circle at bottom left, rgba(255, 156, 97, 0.18), transparent 32%),
                var(--bg);
              color: var(--text);
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              margin: 0;
              min-height: 100vh;
              padding: 24px;
            }

            .shell {
              display: grid;
              gap: 18px;
            }

            .hero,
            .lesson,
            .task {
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 24px;
              box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
              overflow: hidden;
              padding: 22px;
            }

            .hero {
              background:
                linear-gradient(140deg, rgba(74, 178, 255, 0.28), rgba(255, 156, 97, 0.18)),
                var(--panel);
            }

            .eyebrow {
              color: var(--accent);
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.18em;
              margin-bottom: 12px;
              text-transform: uppercase;
            }

            h1 {
              font-size: 32px;
              line-height: 1.08;
              margin: 0 0 10px;
            }

            p {
              color: var(--muted);
              line-height: 1.7;
              margin: 0;
            }

            .meta {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              margin-top: 18px;
            }

            .chip {
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 999px;
              font-size: 13px;
              padding: 10px 14px;
            }

            .stack {
              display: grid;
              gap: 14px;
            }

            .task {
              display: flex;
              flex-direction: column;
              gap: 14px;
            }

            button {
              align-self: flex-start;
              background: linear-gradient(135deg, var(--accent), var(--accent-2));
              border: 0;
              border-radius: 999px;
              color: white;
              cursor: pointer;
              font-size: 14px;
              font-weight: 700;
              padding: 12px 18px;
            }

            .secondary {
              background: var(--panel-soft);
              border: 1px solid var(--line);
            }
          </style>
        </head>
        <body>
          <div class="shell">
            <section class="hero">
              <div class="eyebrow">WebView bridge active</div>
              <h1>${course?.title ?? 'Live lesson studio'}</h1>
              <p>
                ${course?.description ?? 'Your lesson content streams here.'}
              </p>
              <div class="meta">
                <div class="chip">${lessonCount} tasks</div>
                <div class="chip">${course?.level ?? 'Guided'} flow</div>
                <div class="chip">${course?.instructor.name ?? 'Coach'} mentor</div>
              </div>
            </section>

            <section class="lesson stack">
              <div class="task">
                <div class="eyebrow">Lesson 1</div>
                <h2 style="margin:0;">Warm-up and framing</h2>
                <p>Review the learning brief and align on the outcome for this sprint.</p>
                <button onclick="sendTaskComplete(1)">Mark warm-up complete</button>
              </div>
              <div class="task">
                <div class="eyebrow">Lesson 2</div>
                <h2 style="margin:0;">Hands-on build</h2>
                <p>Translate the concept into a polished interaction and confirm the native bridge is healthy.</p>
                <button onclick="sendTaskComplete(1)">Mark build complete</button>
              </div>
              <div class="task">
                <div class="eyebrow">Lesson 3</div>
                <h2 style="margin:0;">Reflection</h2>
                <p>Capture what shipped well, where friction showed up, and what to improve next round.</p>
                <button class="secondary" onclick="sendTaskComplete(2)">Finish final review</button>
              </div>
            </section>
          </div>

          <script>
            function post(payload) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(payload));
              }
            }

            function sendTaskComplete(increment) {
              post({ type: 'TASK_COMPLETE', increment, totalTasks: ${lessonCount} });
            }

            post({ type: 'COURSE_READY', totalTasks: ${lessonCount} });
          </script>
        </body>
      </html>
    `,
    [course?.description, course?.instructor.name, course?.level, course?.title, lessonCount]
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        increment?: number;
        totalTasks?: number;
      };

      if (payload.type === 'COURSE_READY') {
        dispatch(
          openCourse({
            courseId,
            totalTasks: payload.totalTasks ?? lessonCount,
          })
        );
        return;
      }

      if (payload.type === 'TASK_COMPLETE') {
        dispatch(
          completeTask({
            courseId,
            increment: payload.increment ?? 1,
            totalTasks: payload.totalTasks ?? lessonCount,
          })
        );
        dispatch(
          showSnackbar({
            message: 'Lesson progress captured in Redux.',
            tone: 'success',
          })
        );
      }
    } catch {
      dispatch(
        showSnackbar({
          message: 'We received an unreadable lesson event from the WebView.',
          tone: 'error',
        })
      );
    }
  };

  if (isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppLoader label="Preparing the live lesson..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.webviewShell,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          makeShadow(colors.shadow, 10),
        ]}
      >
        <View style={styles.header}>
          <AppText variant="headline">{course?.title ?? 'Lesson Studio'}</AppText>
          <AppText tone="muted">Native token injected and postMessage bridge listening.</AppText>
        </View>

        <WebView
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          originWhitelist={['*']}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accent} size="large" />
              <AppText tone="muted">Loading immersive content...</AppText>
            </View>
          )}
          source={{ html: htmlContent }}
          startInLoadingState
          style={styles.webview}
        />
      </View>
    </SafeAreaView>
  );
}