import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Ruler,
  Scale,
  User,
} from "lucide-react-native";
import { cssInterop } from "nativewind";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WeightUnit } from "../types";
import { sendOnboardingData } from "../utils/deviceSync";
import { formatDateForStorage } from "../utils/date";
import { DatePickerField } from "./DatePickerField";

cssInterop(ArrowRight, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Check, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(ChevronLeft, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Ruler, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(Scale, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});
cssInterop(User, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});

export interface OnboardingValues {
  name: string;
  currentWeight: number;
  currentWeightDate: string;
  unit: WeightUnit;
  heightCm: number;
}

interface OnboardingModalProps {
  onComplete: (values: OnboardingValues) => Promise<void>;
  onFinish: () => void;
}

const TOTAL_STEPS = 3;

const STEP_CONFIG = [
  { icon: User, label: "Your name", placeholder: "What should we call you?" },
  { icon: Scale, label: "Current weight", placeholder: "e.g. 68.25" },
  { icon: Ruler, label: "Height", placeholder: "e.g. 170" },
];

export function OnboardingModal({ onComplete, onFinish }: OnboardingModalProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [weightDate, setWeightDate] = useState(() =>
    formatDateForStorage(new Date())
  );
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const pendingFocusStep = useRef<number | null>(null);
  const nameInputRef = useRef<TextInputInstance>(null);
  const weightInputRef = useRef<TextInputInstance>(null);
  const heightInputRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (pendingFocusStep.current !== step) return;

    const inputForStep = [
      nameInputRef,
      weightInputRef,
      heightInputRef,
    ][step];
    const frame = requestAnimationFrame(() => {
      inputForStep.current?.focus();
      pendingFocusStep.current = null;
    });

    return () => cancelAnimationFrame(frame);
  }, [step]);

  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  const progressAnim = useMemo(() => new Animated.Value(1 / TOTAL_STEPS), []);

  const animateToStep = (nextStep: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    Animated.timing(progressAnim, {
      toValue: (nextStep + 1) / TOTAL_STEPS,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setStep(nextStep);
  };

  const handleNext = () => {
    if (step === 0 && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (step === 1) {
      const w = Number.parseFloat(weight);
      if (!Number.isFinite(w) || w <= 0) {
        setError("Please enter a valid weight");
        return;
      }
    }
    setError("");
    if (step < TOTAL_STEPS - 1) {
      const nextStep = step + 1;
      pendingFocusStep.current = nextStep;
      animateToStep(nextStep);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) {
      const previousStep = step - 1;
      pendingFocusStep.current = previousStep;
      animateToStep(previousStep);
    }
  };

  const handleSubmit = async () => {
    const h = Number.parseFloat(height);
    if (!Number.isFinite(h) || h <= 0 || h > 300) {
      setError("Please enter a valid height in cm");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const values = {
        name: name.trim(),
        currentWeight: Number.parseFloat(weight),
        currentWeightDate: weightDate,
        unit,
        heightCm: h,
      };
      await onComplete(values);
      await sendOnboardingData(values);
      onFinish();
    } catch (submitError) {
      console.error("Unable to finish onboarding:", submitError);
      setError("We could not save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;
  const StepIcon = STEP_CONFIG[step].icon;

  return (
    <View className="absolute inset-0 z-50">
      <KeyboardAvoidingView
        className={`flex-1 bg-[#161329] px-4 ${
          isKeyboardVisible ? "justify-start" : "justify-center"
        }`}
        style={{
          paddingTop:
            (Platform.OS === "ios" ? insets.top : 10) +
            (isKeyboardVisible ? 100 : 0),
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
        }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}

        // className={`flex-1 bg-[#161329] px-4 ${
        //   isKeyboardVisible ? 'justify-start' : 'justify-center'
        // }`}
        // style={{
        //   paddingTop: insets.top + 16,
        //   paddingBottom: Math.max(insets.bottom, 8),
        // }}
        // behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          className="w-full max-w-md self-center overflow-hidden rounded-3xl border border-[#ECE8F5] bg-white"
          style={{ maxHeight: "100%", flexShrink: 1 }}
        >
          {/* Progress Bar */}
          <View className="h-1 w-full bg-[#ECE8F5]">
            <Animated.View
              style={{
                height: "100%",
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                borderRadius: 999,
              }}
            >
              <LinearGradient
                colors={["#4C35DE", "#9B86EC"]}
                style={{ flex: 1, borderRadius: 999 }}
              />
            </Animated.View>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1 }}
            contentContainerStyle={{
              padding: 24,
              gap: 20,
              flexGrow: 0,
            }}
          >
            {/* Header */}
            <View className="items-center gap-3">
              <View className="w-16 h-16 rounded-2xl items-center justify-center shadow-aura">
                <LinearGradient
                  colors={["#4C35DE", "#9B86EC"]}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    borderRadius: 16,
                  }}
                />
                <StepIcon size={28} color="#FFFFFF" />
              </View>
              <View className="items-center gap-1">
                <Text className="text-[22px] font-bold text-[#161329]">
                  {step === 0 && "Welcome aboard"}
                  {step === 1 && "Your starting point"}
                  {step === 2 && "Almost there"}
                </Text>
                <Text className="text-[14px] text-[#645F78] text-center">
                  {step === 0 && "Let’s personalize your experience"}
                  {step === 1 && "We’ll use this to track your progress"}
                  {step === 2 && "This helps us calculate your BMI"}
                </Text>
              </View>
            </View>

            {/* Step Content */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {step === 0 && (
                <View className="gap-2">
                  <Text className="text-[14px] font-semibold text-[#161329]">
                    Your name
                  </Text>
                  <TextInput
                    ref={nameInputRef}
                    value={name}
                    onChangeText={setName}
                    placeholder="What should we call you?"
                    autoCapitalize="words"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={handleNext}
                    accessibilityLabel="Your name"
                    className="rounded-xl border-2 border-[#ECE8F5] bg-[#F7F6FA] px-4 py-3.5 text-[16px] text-[#161329] focus:border-[#4C35DE]"
                  />
                </View>
              )}

              {step === 1 && (
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] font-semibold text-[#161329]">
                      Current weight
                    </Text>
                    <View className="flex-row rounded-full bg-[#ECE8F5] p-1">
                      {(['kg', 'lbs'] as const).map((option) => (
                        <Pressable
                          key={option}
                          onPress={() => setUnit(option)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: unit === option }}
                          accessibilityLabel={`Use ${option}`}
                          className={`rounded-full px-4 py-1.5 ${unit === option ? 'bg-white' : ''}`}
                        >
                          <Text
                            className={`text-[13px] font-semibold ${unit === option ? 'text-[#161329]' : 'text-[#645F78]'}`}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      ref={weightInputRef}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder={unit === "kg" ? "e.g. 68.25" : "e.g. 150.25"}
                      keyboardType="decimal-pad"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={handleNext}
                      accessibilityLabel={`Current weight in ${unit}`}
                      className="min-w-0 flex-1 rounded-xl border-2 border-[#ECE8F5] bg-[#F7F6FA] px-3 py-3.5 text-[16px] text-[#161329] focus:border-[#4C35DE]"
                    />
                    <View className="min-w-0 flex-1">
                      <DatePickerField
                        value={weightDate}
                        onChange={setWeightDate}
                        maximumDate={new Date()}
                      />
                    </View>
                  </View>
                </View>
              )}

              {step === 2 && (
                <View className="gap-2">
                  <Text className="text-[14px] font-semibold text-[#161329]">
                    Height (cm)
                  </Text>
                  <TextInput
                    ref={heightInputRef}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="e.g. 170"
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    accessibilityLabel="Height in centimeters"
                    className="rounded-xl border-2 border-[#ECE8F5] bg-[#F7F6FA] px-4 py-3.5 text-[16px] text-[#161329] focus:border-[#4C35DE]"
                  />
                </View>
              )}
            </Animated.View>

            {/* Error */}
            {error ? (
              <Text
                accessibilityRole="alert"
                className="text-[13px] font-medium text-rose-600"
              >
                {error}
              </Text>
            ) : null}

            {/* Navigation */}
            <View className="flex-row gap-3">
              {step > 0 && (
                <Pressable
                  onPress={handleBack}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  className="items-center justify-center rounded-full border-2 border-[#ECE8F5] px-5 py-3.5"
                >
                  <ChevronLeft size={20} color="#645F78" />
                </Pressable>
              )}
              <Pressable
                onPress={isLastStep ? handleSubmit : handleNext}
                disabled={isSubmitting}
                accessibilityRole="button"
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3.5 ${
                  isSubmitting
                    ? "bg-[#ECE8F5]"
                    : "bg-[#4C35DE] shadow-aura-glow"
                }`}
              >
                {isLastStep ? (
                  isSubmitting ? (
                    <Text className="text-[16px] font-semibold text-white">
                      Saving…
                    </Text>
                  ) : (
                    <>
                      <Check size={18} color="#FFFFFF" />
                      <Text className="text-[16px] font-semibold text-white">
                        Get started
                      </Text>
                    </>
                  )
                ) : (
                  <>
                    <Text className="text-[16px] font-semibold text-white">
                      Continue
                    </Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </>
                )}
              </Pressable>
            </View>

            {/* Step Indicators */}
            <View className="flex-row justify-center gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i === step
                      ? "w-6 bg-[#4C35DE]"
                      : i < step
                        ? "w-1.5 bg-[#9B86EC]"
                        : "w-1.5 bg-[#ECE8F5]"
                  }`}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
