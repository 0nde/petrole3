import { describe, it, expect } from 'vitest';
import { calculateFlowWidth, calculateFlowOpacity } from './flowGeometry';

describe('flowGeometry utils', () => {
  describe('calculateFlowWidth', () => {
    it('retourne au minimum 1px pour des volumes très faibles', () => {
      expect(calculateFlowWidth(0)).toBeGreaterThanOrEqual(1);
      expect(calculateFlowWidth(0.01)).toBeGreaterThanOrEqual(1);
    });

    it('retourne au maximum 12px pour des volumes très élevés', () => {
      expect(calculateFlowWidth(1000)).toBeLessThanOrEqual(12);
      expect(calculateFlowWidth(10000)).toBeLessThanOrEqual(12);
    });

    it('augmente avec le volume (échelle logarithmique)', () => {
      const width1 = calculateFlowWidth(1);
      const width10 = calculateFlowWidth(10);
      const width100 = calculateFlowWidth(100);
      
      expect(width10).toBeGreaterThan(width1);
      expect(width100).toBeGreaterThan(width10);
    });

    it('retourne des valeurs cohérentes pour des volumes typiques', () => {
      // 0.1 mbpd (très faible) → ~1px
      expect(calculateFlowWidth(0.1)).toBeCloseTo(1, 0);
      
      // 10 mbpd (moyen) → ~4px
      expect(calculateFlowWidth(10)).toBeCloseTo(4, 0);
      
      // 100 mbpd (élevé) → ~7px
      expect(calculateFlowWidth(100)).toBeCloseTo(7, 0);
    });
  });

  describe('calculateFlowOpacity', () => {
    it('retourne au minimum 0.3 pour des volumes faibles', () => {
      expect(calculateFlowOpacity(0)).toBe(0.3);
      expect(calculateFlowOpacity(0.1)).toBeGreaterThanOrEqual(0.3);
    });

    it('retourne au maximum 0.8 pour des volumes élevés', () => {
      expect(calculateFlowOpacity(100)).toBeLessThanOrEqual(0.8);
      expect(calculateFlowOpacity(1000)).toBeLessThanOrEqual(0.8);
    });

    it('augmente avec le volume', () => {
      const opacity1 = calculateFlowOpacity(1);
      const opacity5 = calculateFlowOpacity(5);
      const opacity10 = calculateFlowOpacity(10);
      
      expect(opacity5).toBeGreaterThan(opacity1);
      expect(opacity10).toBeGreaterThan(opacity5);
    });

    it('retourne des valeurs dans la plage [0.3, 0.8]', () => {
      const testVolumes = [0, 0.5, 1, 5, 10, 50, 100];
      
      testVolumes.forEach(volume => {
        const opacity = calculateFlowOpacity(volume);
        expect(opacity).toBeGreaterThanOrEqual(0.3);
        expect(opacity).toBeLessThanOrEqual(0.8);
      });
    });
  });
});
