
// @vitest-only
import { vi } from 'vitest';

/**
 * Create a mock PostgrestFilterBuilder object for Supabase
 * This is used to mock the return values of Supabase client methods
 */
export function createMockFilterBuilder() {
  // Create a mock response object with PostgrestBuilder structure
  const mockResponse = {
    data: null,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
    body: null
  };

  // Create a function that creates a chainable instance
  const createChainableInstance = () => {
    // Create the base builder object with all required properties
    const baseBuilder = {
      data: null,
      error: null,
      status: 200,
      statusText: 'OK',
      count: null,
      body: null,
      schema: 'public',
      url: 'mock-url',
      headers: {},
      path: 'mock-path',
      searchParams: new URLSearchParams(),
      shouldThrowOnError: false,
      isMaybeSingle: false,
      throwOnError: function() { return this; },
      returns: function() { return this; },
      overrideTypes: function() { return this; },
      setHeader: function() { return this; },
      fetch: function() { return Promise.resolve(mockResponse); },
      then: function(callback) { return Promise.resolve(mockResponse).then(callback); },
      catch: function(callback) { return Promise.resolve(mockResponse).catch(callback); }
    };
    
    // Add method as a non-enumerable property to match the original implementation
    Object.defineProperty(baseBuilder, 'method', {
      value: 'GET',
      writable: true,
      enumerable: false // Make it non-enumerable to better mimic protected property
    });

    // Create method that returns properly structured objects
    const createFilterMethod = () => {
      const result = {...baseBuilder};
      // Make sure method is properly set as non-enumerable
      Object.defineProperty(result, 'method', {
        value: 'GET',
        writable: true,
        enumerable: false
      });
      return result;
    };

    // Define all the filter methods
    const filterMethods = {
      select: () => createFilterMethod(),
      eq: () => createFilterMethod(),
      neq: () => createFilterMethod(),
      gt: () => createFilterMethod(),
      gte: () => createFilterMethod(),
      lt: () => createFilterMethod(),
      lte: () => createFilterMethod(),
      like: () => createFilterMethod(),
      ilike: () => createFilterMethod(),
      likeAllOf: () => createFilterMethod(),
      likeAnyOf: () => createFilterMethod(),
      ilikeAllOf: () => createFilterMethod(),
      ilikeAnyOf: () => createFilterMethod(),
      is: () => createFilterMethod(),
      in: () => createFilterMethod(),
      contains: () => createFilterMethod(),
      containedBy: () => createFilterMethod(),
      rangeGt: () => createFilterMethod(),
      rangeGte: () => createFilterMethod(),
      rangeLt: () => createFilterMethod(),
      rangeLte: () => createFilterMethod(),
      rangeAdjacent: () => createFilterMethod(),
      overlaps: () => createFilterMethod(),
      textSearch: () => createFilterMethod(),
      match: () => createFilterMethod(),
      not: () => createFilterMethod(),
      or: () => createFilterMethod(),
      and: () => createFilterMethod(),
      filter: () => createFilterMethod(),
      filter_: () => createFilterMethod(),
      order: () => createFilterMethod(),
      limit: () => createFilterMethod(),
      offset: () => createFilterMethod(),
      range: () => createFilterMethod(),
      single: () => createFilterMethod(),
      maybeSingle: () => createFilterMethod(),
      csv: () => createFilterMethod(),
      geojson: () => createFilterMethod(),
      explain: () => createFilterMethod(),
      collect: () => createFilterMethod(),
      head: () => createFilterMethod(),
      get: () => createFilterMethod(),
      // Additional methods
      cs: () => createFilterMethod(),
      cd: () => createFilterMethod(),
      ova: () => createFilterMethod(),
      ovr: () => createFilterMethod(),
      sl: () => createFilterMethod(),
      sr: () => createFilterMethod(),
      nxl: () => createFilterMethod(),
      nxr: () => createFilterMethod(),
      adj: () => createFilterMethod(),
      fts: () => createFilterMethod(),
      plfts: () => createFilterMethod(),
      phfts: () => createFilterMethod(),
      wfts: () => createFilterMethod(),
      inRange: () => createFilterMethod(),
      asc: () => createFilterMethod(),
      desc: () => createFilterMethod(),
      isNot: () => createFilterMethod(),
      notIn: () => createFilterMethod(),
      abortSignal: () => createFilterMethod(),
      rollback: () => createFilterMethod()
    };
    
    // Create final chainable object
    const chainable = {...baseBuilder, ...filterMethods};
    
    // Make sure method is properly set as non-enumerable in the final object
    Object.defineProperty(chainable, 'method', {
      value: 'GET',
      writable: true,
      enumerable: false
    });
    
    return chainable;
  };
  
  // Return a chainable instance
  return createChainableInstance();
}

/**
 * Mock for Supabase RPC calls
 * Creates a function that returns mock data with PostgrestFilterBuilder-like interface
 */
export function createMockRpcResponse(data: any) {
  // Create base mock response
  const mockResponse = { 
    data, 
    error: null,
    status: 200,
    statusText: 'OK',
    count: null,
    body: null
  };
  
  // Create a chainable filter builder to properly implement all required methods
  const filterBuilder = createMockFilterBuilder();
  
  // Create the mock RPC response object with the right shape
  const baseObject = {
    data,
    error: null,
    status: 200,
    statusText: 'OK',
    count: null,
    body: null,
    url: 'mock-rpc-url',
    path: 'rpc/mock-function',
    schema: 'public',
    headers: {},
    isMaybeSingle: false,
    searchParams: new URLSearchParams(),
    shouldThrowOnError: false,
    throwOnError: function() { return this; },
    returns: function() { return this; },
    overrideTypes: function() { return this; },
    setHeader: function() { return this; },
    fetch: function() { return Promise.resolve(mockResponse); },
    then: function(callback) { return Promise.resolve(mockResponse).then(callback); },
    catch: function(callback) { return Promise.resolve(mockResponse).catch(callback); }
  };
  
  // Add method as a non-enumerable property to match PostgrestFilterBuilder
  Object.defineProperty(baseObject, 'method', {
    value: 'POST',
    writable: true,
    enumerable: false
  });
  
  // Create the return value with all expected properties and methods
  const returnValue = {...baseObject};
  
  // Copy ALL methods from filterBuilder to ensure the mock has all required methods
  for (const key of Object.getOwnPropertyNames(filterBuilder)) {
    if (typeof filterBuilder[key] === 'function' && !returnValue[key]) {
      // Create a chainable method that returns the same response
      returnValue[key] = function() { return returnValue; };
    }
  }
  
  // Make sure all PostgrestFilterBuilder methods are implemented
  const filterMethods = [
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'likeAllOf', 'likeAnyOf', 'ilikeAllOf', 'ilikeAnyOf',
    'is', 'in', 'contains', 'containedBy', 'not', 'or', 'and',
    'filter', 'filter_', 'match', 'order', 'limit', 'offset', 'range',
    'single', 'maybeSingle', 'csv', 'geojson', 'explain',
    'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte', 'rangeAdjacent',
    'overlaps', 'textSearch', 'collect', 'head', 'get',
    'cs', 'cd', 'ova', 'ovr', 'sl', 'sr', 'nxl', 'nxr', 'adj', 
    'fts', 'plfts', 'phfts', 'wfts', 'inRange', 'asc', 'desc',
    'isNot', 'notIn', 'abortSignal', 'rollback'
  ];
  
  filterMethods.forEach(method => {
    if (!returnValue[method]) {
      returnValue[method] = function() { return returnValue; };
    }
  });
  
  // Ensure method is properly set as non-enumerable
  Object.defineProperty(returnValue, 'method', {
    value: 'POST',
    writable: true,
    enumerable: false
  });
  
  return returnValue;
}
