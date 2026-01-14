import OptimizedFlatList from '../../components/common/OptimizedFlatList';

describe('OptimizedFlatList', () => {
  it('should be importable', () => {
    expect(OptimizedFlatList).toBeDefined();
    // OptimizedFlatList es un componente memo, por lo que es un objeto
    expect(typeof OptimizedFlatList).toBe('object');
  });

  it('should have displayName', () => {
    expect(OptimizedFlatList.displayName).toBe('OptimizedFlatList');
  });

  // Tests simplificados que solo verifican que el componente existe
  // Los tests de renderizado completo requieren mocks más complejos de React Native
});
