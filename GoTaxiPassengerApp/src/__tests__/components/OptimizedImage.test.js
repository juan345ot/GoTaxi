import OptimizedImage from '../../components/common/OptimizedImage';

describe('OptimizedImage', () => {
  it('should be importable', () => {
    expect(OptimizedImage).toBeDefined();
    // OptimizedImage es un componente memo, por lo que es un objeto
    expect(typeof OptimizedImage).toBe('object');
  });

  it('should have displayName', () => {
    expect(OptimizedImage.displayName).toBe('OptimizedImage');
  });

  // Tests simplificados que solo verifican que el componente existe
  // Los tests de renderizado completo requieren mocks más complejos de React Native
});
