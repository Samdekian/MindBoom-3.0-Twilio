
import { PROVIDER_DEPENDENCIES } from '@/types/core/providers';

/**
 * Calculate provider dependency levels to determine optimal nesting order
 */
export function calculateProviderLevels(): Record<string, number> {
  const levels: Record<string, number> = {};
  const providers = Object.keys(PROVIDER_DEPENDENCIES);
  
  // Initialize with level 0
  providers.forEach(provider => {
    levels[provider] = 0;
  });
  
  // Calculate max dependency level
  const calculateLevel = (provider: string, visited: Set<string> = new Set()): number => {
    if (visited.has(provider)) {
      console.warn(`Circular dependency detected for provider: ${provider}`);
      return levels[provider]; 
    }
    
    visited.add(provider);
    
    const dependencies = PROVIDER_DEPENDENCIES[provider] || [];
    if (dependencies.length === 0) {
      return 0;
    }
    
    let maxDependencyLevel = 0;
    for (const dependency of dependencies) {
      if (levels[dependency] === 0) {
        levels[dependency] = calculateLevel(dependency, new Set(visited));
      }
      maxDependencyLevel = Math.max(maxDependencyLevel, levels[dependency]);
    }
    
    return maxDependencyLevel + 1;
  };
  
  // Calculate for all providers
  providers.forEach(provider => {
    if (levels[provider] === 0) {
      levels[provider] = calculateLevel(provider);
    }
  });
  
  return levels;
}

/**
 * Generate optimal provider nesting order
 */
export function getOptimalProviderOrder(): string[] {
  const levels = calculateProviderLevels();
  return Object.keys(levels).sort((a, b) => levels[a] - levels[b]);
}

/**
 * Check if there are circular dependencies in the provider graph
 */
export function detectCircularDependencies(): string[][] {
  const dependencies = PROVIDER_DEPENDENCIES;
  const circularPaths: string[][] = [];
  
  const detectCycles = (
    provider: string, 
    visited: Set<string> = new Set(), 
    path: string[] = []
  ) => {
    if (visited.has(provider)) {
      const cycleStart = path.indexOf(provider);
      if (cycleStart >= 0) {
        circularPaths.push(path.slice(cycleStart).concat(provider));
      }
      return;
    }
    
    visited.add(provider);
    path.push(provider);
    
    for (const dependency of dependencies[provider] || []) {
      detectCycles(dependency, new Set(visited), [...path]);
    }
  };
  
  for (const provider of Object.keys(dependencies)) {
    detectCycles(provider);
  }
  
  return circularPaths;
}
