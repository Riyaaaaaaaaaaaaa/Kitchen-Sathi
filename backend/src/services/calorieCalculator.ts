/**
 * Simple Calorie Calculator Service
 * Uses basic BMR (Basal Metabolic Rate) formula
 */

export interface UserCalorieData {
  age: number;
  gender: string;
  weight: number; // in kg
  height: number; // in cm
}

export class CalorieCalculator {
  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   * For men: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
   * For women: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
   */
  static calculateBMR(userData: UserCalorieData): number {
    const { age, gender, weight, height } = userData;

    let bmr: number;

    if (gender.toLowerCase() === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      // female or other
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    return Math.round(bmr);
  }

  /**
   * Calculate recommended daily calories
   * Assumes moderate activity level (1.55 multiplier)
   */
  static calculateDailyCalories(userData: UserCalorieData): number {
    const bmr = this.calculateBMR(userData);
    
    // Moderate activity multiplier (1.55)
    const dailyCalories = bmr * 1.55;
    
    return Math.round(dailyCalories);
  }

  /**
   * Get status based on consumed vs recommended calories
   * @param consumed - Calories consumed
   * @param recommended - Recommended calories
   * @returns 'good' | 'over' | 'under'
   */
  static getCalorieStatus(consumed: number, recommended: number): 'good' | 'over' | 'under' {
    const diff = consumed - recommended;

    // Within 200 calories is good
    if (Math.abs(diff) <= 200) {
      return 'good';
    }

    // Over recommended
    if (diff > 0) {
      return 'over';
    }

    // Under recommended
    return 'under';
  }

  /**
   * Get color for status
   */
  static getStatusColor(status: 'good' | 'over' | 'under'): string {
    switch (status) {
      case 'good':
        return 'green';
      case 'over':
        return 'orange';
      case 'under':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get status label
   */
  static getStatusLabel(status: 'good' | 'over' | 'under'): string {
    switch (status) {
      case 'good':
        return 'On Track ✓';
      case 'over':
        return 'Over Limit';
      case 'under':
        return 'Under Goal';
      default:
        return 'Unknown';
    }
  }
}

