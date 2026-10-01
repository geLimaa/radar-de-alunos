import { engagementBand } from "./engagement-band";

describe('engagementBand', () => {
  
  it('should return "never" when value is null', () => {
    expect(engagementBand(null)).toBe('never');
  });

  it('should return "never" when value is 0', () => {
    expect(engagementBand(0)).toBe('engaged');
  });

  it('should return "engaged" for values from 0 to 14', () => {
    expect(engagementBand(1)).toBe('engaged');
    expect(engagementBand(14)).toBe('engaged');
  });

  it('should return "sliping" for values from 15 to 30', () => {
    expect(engagementBand(15)).toBe('sliping');
    expect(engagementBand(30)).toBe('sliping');
  });

  it('should return "disengaged" for values above 30', () => {
    expect(engagementBand(31)).toBe('disengaged');
  });
});