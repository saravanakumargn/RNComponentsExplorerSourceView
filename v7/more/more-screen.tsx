import { Button, Form, HStack, Image, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';

import { NativeScreen } from '@/components/native-ui/native-screen';
import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { openAppStoreListing, useAppUpdate } from '@/features/updates/use-app-update';

import {
  contactSupport,
  openLinkedInProfile,
  openPrivacy,
  openStoreReview,
  openTerms,
  openUpworkProfile,
  shareThisApp,
  submitFeedback,
} from './more-actions';
import { ResetProgressDialog } from './reset-progress-dialog';
import { useMoreScreen } from './use-more-screen';

/**
 * What the hero section promises. It advertises the *library* purchase, which
 * is the one that unlocks content — a treat only removes ads, and saying
 * otherwise here would contradict the support screen this section opens.
 */
const SUPPORT_BENEFITS = [
  'Every lesson, quiz, and interview question',
  'Offline on this device, one time, no subscription',
  'Ads removed across the whole app',
] as const;

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const SUCCESS = '#34C759';
const NEUTRAL = '#8E8E93';

const appVersion = Application.nativeApplicationVersion ?? '—';
const buildVersion = Application.nativeBuildVersion ?? '—';

/**
 * The More tab as a real SwiftUI `Form`.
 *
 * This screen was already a settings screen wearing Material cards — grouped
 * sections drawn by hand out of `Card` and `Divider`, with a hand-rolled row
 * that had to restate iOS's own metrics. `Form` and `Section` are that design,
 * so the conversion mostly deletes code rather than translating it.
 *
 * The Paper version stays as `more-screen.tsx` and still serves Android; Metro
 * picks this file on iOS.
 */
export function MoreScreen() {
  const router = useRouter();
  const { latestVersion, updateAvailable } = useAppUpdate();
  const {
    adsRemoved,
    dismissReset,
    isLoading,
    isResetting,
    isRestoring,
    learningUnlocked,
    onResetProgress,
    onRestore,
    pendingReset,
    performReset,
    resetMessage,
    restoreMessage,
  } = useMoreScreen();

  return (
    <>
      <NativeScreen testID="maestro-more-ready">
        <Form>
          <Section>
            {isLoading ? (
              <Text modifiers={[foregroundStyle(SECONDARY), padding({ vertical: 8 })]}>
                Checking your purchases…
              </Text>
            ) : adsRemoved ? (
              <SupporterSummary learningUnlocked={learningUnlocked} onPress={() => router.push('/support')} />
            ) : (
              <SupportHero onPress={() => router.push('/support')} />
            )}
          </Section>

          <Section
            footer={
              <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                Know someone learning React Native? Sharing the app gives their journey a boost.
              </Text>
            }
          >
            <NativeNavRow
              onPress={() => void shareThisApp()}
              symbol="square.and.arrow.up"
              title="Share this app"
              tint={NATIVE_TINT}
            />
          </Section>

          <Section title="App">
            {/* Only ever rendered when the store is genuinely ahead, so it
                needs no dismissal: it disappears by updating. */}
            {updateAvailable ? (
              <NativeNavRow
                description={`Version ${latestVersion} is on the App Store`}
                onPress={() => void openAppStoreListing()}
                symbol="arrow.down.circle.fill"
                testID="more-update-available"
                tint={SUCCESS}
                title="Update available"
                trailing={latestVersion ?? undefined}
              />
            ) : null}
            <NativeNavRow
              description="Tell us what to build next"
              onPress={() => void openStoreReview()}
              symbol="star.fill"
              tint="#FF9500"
              title="Rate & review the app"
            />
            <NativeNavRow
              description="Share ideas, bugs, or requests"
              onPress={() => void submitFeedback()}
              symbol="bubble.left.fill"
              tint={NATIVE_TINT}
              title="Send feedback"
            />
            <NativeNavRow
              description="Reach the team directly"
              onPress={() => void contactSupport()}
              symbol="envelope.fill"
              tint={NATIVE_TINT}
              title="Contact us by email"
            />
          </Section>

          <Section title="Work with me">
            <NativeNavRow
              description="Freelance React Native work, audits, and consulting"
              onPress={() => void openUpworkProfile()}
              symbol="briefcase.fill"
              tint={SUCCESS}
              title="Hire me on Upwork"
            />
            <NativeNavRow
              description="See my experience and get in touch"
              onPress={() => void openLinkedInProfile()}
              symbol="person.crop.circle.fill"
              tint={NATIVE_TINT}
              title="Connect on LinkedIn"
            />
          </Section>

          <Section
            title="Purchases & legal"
            footer={
              restoreMessage ? (
                <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                  {restoreMessage}
                </Text>
              ) : undefined
            }
          >
            <NativeNavRow
              description="Already bought? Bring it back"
              onPress={() => void onRestore()}
              symbol="arrow.clockwise"
              tint="#5856D6"
              title="Restore purchases"
              trailing={isRestoring ? 'Restoring…' : undefined}
            />
            <NativeNavRow
              onPress={() => void openPrivacy()}
              symbol="hand.raised.fill"
              tint={NEUTRAL}
              title="Privacy policy"
            />
            <NativeNavRow
              onPress={() => void openTerms()}
              symbol="doc.text.fill"
              tint={NEUTRAL}
              title="Terms of service"
            />
          </Section>

          <Section
            title="Learning progress"
            footer={
              <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                {resetMessage ??
                  `React Native Components Explorer · Version ${appVersion} (${buildVersion})`}
              </Text>
            }
          >
            <NativeNavRow
              description="Clear finished lessons, quiz results, and review history"
              destructive
              onPress={() => void onResetProgress()}
              symbol="arrow.counterclockwise"
              testID="more-reset-progress"
              title="Reset learning progress"
              trailing={isResetting ? 'Resetting…' : undefined}
            />
          </Section>
        </Form>
      </NativeScreen>

      {pendingReset ? (
        <ResetProgressDialog
          isResetting={isResetting}
          onCancel={dismissReset}
          onConfirm={() => void performReset()}
          summary={pendingReset}
        />
      ) : null}
    </>
  );
}

/**
 * The purchase pitch, as a section rather than the gradient card it replaces.
 *
 * A gradient hero is not something iOS does in a settings list, and `@expo/ui`
 * has no gradient background modifier to draw one with. Sitting the same copy
 * on a plain grouped row, led by a tinted symbol and closed by a prominent
 * button, is what the platform does instead.
 */
function SupportHero({ onPress }: { onPress: () => void }) {
  return (
    <VStack alignment="leading" spacing={12} modifiers={[padding({ vertical: 6 })]}>
      <HStack spacing={10}>
        <Image color={NATIVE_TINT} size={24} systemName="lock.open.fill" />
        <Text modifiers={[font({ textStyle: 'headline' })]}>Unlock the learning library</Text>
        <Spacer />
      </HStack>

      <Text modifiers={[font({ textStyle: 'subheadline' }), foregroundStyle(SECONDARY)]}>
        One purchase, one time. Nothing renews.
      </Text>

      {SUPPORT_BENEFITS.map((benefit) => (
        <HStack key={benefit} spacing={10}>
          <Image color={SUCCESS} size={15} systemName="checkmark.circle.fill" />
          <Text modifiers={[font({ textStyle: 'subheadline' })]}>{benefit}</Text>
          <Spacer />
        </HStack>
      ))}

      <Text modifiers={[font({ textStyle: 'caption' }), foregroundStyle(SECONDARY)]}>
        Or just buy us a treat — it removes ads, and does not open the library.
      </Text>

      <Button
        modifiers={[buttonStyle('borderedProminent'), controlSize('large')]}
        onPress={onPress}
        testID="more-support-card"
      >
        <HStack>
          <Spacer />
          <Text modifiers={[font({ textStyle: 'headline' })]}>See the options</Text>
          <Spacer />
        </HStack>
      </Button>
    </VStack>
  );
}

/**
 * Shown to anyone who has bought anything. It has to distinguish the two, or a
 * reader who only bought a treat is told their lessons are open when they are
 * not — the exact claim the treat copy goes out of its way to deny.
 */
function SupporterSummary({ learningUnlocked, onPress }: { learningUnlocked: boolean; onPress: () => void }) {
  if (learningUnlocked) {
    return (
      <HStack spacing={12} modifiers={[padding({ vertical: 6 })]}>
        <Image color={SUCCESS} size={28} systemName="checkmark.seal.fill" />
        <VStack alignment="leading" spacing={3}>
          <Text modifiers={[font({ textStyle: 'headline' })]}>You&apos;ve unlocked everything</Text>
          <Text modifiers={[font({ textStyle: 'subheadline' }), foregroundStyle(SECONDARY)]}>
            Every lesson is unlocked and ads are off. Thanks for supporting the app!
          </Text>
        </VStack>
        <Spacer />
      </HStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={12} modifiers={[padding({ vertical: 6 })]}>
      <HStack spacing={12}>
        <Image color="#FF2D55" size={28} systemName="heart.fill" />
        <VStack alignment="leading" spacing={3}>
          <Text modifiers={[font({ textStyle: 'headline' })]}>Thanks for the treat</Text>
          <Text modifiers={[font({ textStyle: 'subheadline' }), foregroundStyle(SECONDARY)]}>
            Ads are off across the app. The learning library is still locked.
          </Text>
        </VStack>
        <Spacer />
      </HStack>
      <Button
        modifiers={[buttonStyle('bordered'), controlSize('large')]}
        onPress={onPress}
        testID="more-support-card"
      >
        <HStack>
          <Spacer />
          <Text modifiers={[font({ textStyle: 'headline' })]}>Unlock the library</Text>
          <Spacer />
        </HStack>
      </Button>
    </VStack>
  );
}
