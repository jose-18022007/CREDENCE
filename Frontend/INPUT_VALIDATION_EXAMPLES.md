# Text Input Validation Examples

The text analysis now validates input to ensure meaningful content.

## Invalid Inputs (Will be Rejected)

### Only Numbers
```
12345678901234567890
```
❌ Error: "Invalid input: Text cannot contain only numbers"

### Only Special Characters
```
!@#$%^&*()_+-=[]{}|;:'",.<>?/~`
```
❌ Error: "Invalid input: Text must contain at least some letters"

### Mostly Special Characters
```
!!!@@@ ### $$$ %%% ^^^ &&& ***
```
❌ Error: "Invalid input: Text contains too many special characters"

### Only Repeated Characters
```
aaaaaaaaaaaaaaaaaaaaaa
```
❌ Error: "Invalid input: Text cannot be only repeated characters"

### Too Few Meaningful Words
```
a b c
```
❌ Error: "Invalid input: Text must contain at least 3 meaningful words"

### Mixed Invalid (numbers + special chars)
```
123 !!! 456 ### 789
```
❌ Error: "Invalid input: Text must contain at least some letters"

## Valid Inputs (Will be Accepted)

### Normal News Text
```
President announces new climate policy targeting carbon emissions by 2030
```
✅ Valid - Contains meaningful words and proper sentence structure

### Text with Numbers
```
The company reported 25% growth in Q4 2024 earnings
```
✅ Valid - Contains letters and meaningful content

### Text with Some Special Characters
```
Breaking: New study shows 87% of users prefer AI-powered tools!
```
✅ Valid - Special characters are part of normal text

### Short but Valid
```
This is a valid news headline
```
✅ Valid - Contains 6 meaningful words

## Validation Rules

1. **Minimum 10 characters** (after trimming)
2. **Cannot be only numbers** (e.g., "123456789")
3. **Must contain letters** (at least some alphabetic characters)
4. **Cannot be mostly special characters** (must be at least 20% alphanumeric)
5. **Cannot be repeated characters** (e.g., "aaaaaaa")
6. **Must have 3+ meaningful words** (words with 2+ letters)

## Where Validation Happens

- **Frontend**: Immediate validation before API call (AnalyzePage.tsx)
- **Backend**: Server-side validation in text analysis endpoint (text_analysis.py)

Both layers ensure invalid inputs are caught early with clear error messages.
