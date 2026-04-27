import random

class ClinicalFeatureGenerator:
    """
    Generates fake but realistic clinical features based on the predicted O-RADS score.
    Features are consistent with the score level (1 = normal, 5 = highly suspicious).
    """

    @staticmethod
    def generate_features(orad_score):
        # Base values for each score level
        if orad_score == 1:   # Normal ovary
            size_mm = random.uniform(20, 35)
            cyst_type = "None"
            solid_pct = 0
            vascularity = "Absent"
            septations = "No septations"
            wall = "Smooth"
            contrast = "Low"
            brightness = random.uniform(120, 180)
            contrast_val = random.uniform(10, 25)

        elif orad_score == 2:   # Simple benign cyst
            size_mm = random.uniform(35, 60)
            cyst_type = "Simple"
            solid_pct = random.uniform(0, 5)
            vascularity = "Absent"
            septations = "No septations"
            wall = "Smooth"
            contrast = "Low"
            brightness = random.uniform(100, 150)
            contrast_val = random.uniform(20, 35)

        elif orad_score == 3:   # Indeterminate
            size_mm = random.uniform(60, 100)
            cyst_type = random.choice(["Complex", "Hemorrhagic"])
            solid_pct = random.uniform(5, 15)
            vascularity = "Minimal"
            septations = random.choice(["Few thin septations", "Multiple thin septations"])
            wall = "Slightly irregular"
            contrast = "Moderate"
            brightness = random.uniform(80, 120)
            contrast_val = random.uniform(35, 50)

        elif orad_score == 4:   # Suspicious
            size_mm = random.uniform(80, 120)
            cyst_type = "Complex"
            solid_pct = random.uniform(15, 40)
            vascularity = "Moderate"
            septations = "Multiple thin septations"
            wall = "Irregular"
            contrast = "High"
            brightness = random.uniform(70, 100)
            contrast_val = random.uniform(50, 70)

        else:   # orad_score == 5   # Highly suspicious / malignant
            size_mm = random.uniform(100, 150)
            cyst_type = random.choice(["Complex", "Solid components"])
            solid_pct = random.uniform(40, 95)
            vascularity = random.choice(["Pronounced", "Extensive"])
            septations = "Multiple thick septations"
            wall = "Irregular with nodules"
            contrast = "High"
            brightness = random.uniform(50, 80)
            contrast_val = random.uniform(70, 100)

        # Round values
        size_mm = round(size_mm, 1)
        solid_pct = round(solid_pct)

        return {
            'size_mm': size_mm,
            'cyst_type': cyst_type,
            'solid_components_percentage': solid_pct,
            'vascularity': vascularity,
            'septations': septations,
            'wall_irregularity': wall,
            'contrast': contrast,
            'brightness': float(brightness),
            'contrast_value': float(contrast_val)
        }