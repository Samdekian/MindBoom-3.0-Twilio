
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePreparationState } from "../usePreparationState";

describe("usePreparationState", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => usePreparationState());
    
    expect(result.current.deviceChecklist).toEqual({
      camera: false,
      microphone: false,
      speaker: false
    });
    
    expect(result.current.environmentChecklist).toEqual({
      network: false,
      lighting: false,
      noise: false
    });
  });
  
  it("updates device checklist correctly", () => {
    const { result } = renderHook(() => usePreparationState());
    
    act(() => {
      result.current.updateDeviceChecklist("camera", true);
    });
    
    expect(result.current.deviceChecklist).toEqual({
      camera: true,
      microphone: false,
      speaker: false
    });
  });
  
  it("updates environment checklist correctly", () => {
    const { result } = renderHook(() => usePreparationState());
    
    act(() => {
      result.current.updateEnvironmentChecklist("network", true);
      result.current.updateEnvironmentChecklist("lighting", true);
    });
    
    expect(result.current.environmentChecklist).toEqual({
      network: true,
      lighting: true,
      noise: false
    });
  });
});
