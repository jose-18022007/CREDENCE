# ✅ Project Renamed from TruthLens to Credence

## Changes Made

All references to "TruthLens" have been updated to "Credence" throughout the codebase.

### Files Updated:

#### Backend Core Files:
1. ✅ `truthlens-backend/config.py`
   - APP_NAME: "Credence API"
   - DATABASE_URL: "credence.db"

2. ✅ `truthlens-backend/main.py`
   - API name: "Credence API"
   - Health check: "Credence API"
   - Shutdown message: "Credence API"

3. ✅ `truthlens-backend/database/db.py`
   - DATABASE_PATH: "credence.db"

4. ✅ `truthlens-backend/services/gemini_service.py`
   - Prompt: "You are Credence, an expert fact-checking..."

#### Module Docstrings:
5. ✅ `truthlens-backend/utils/__init__.py`
6. ✅ `truthlens-backend/database/__init__.py`
7. ✅ `truthlens-backend/models/__init__.py`
8. ✅ `truthlens-backend/services/__init__.py`
9. ✅ `truthlens-backend/routers/__init__.py`

#### Scripts:
10. ✅ `truthlens-backend/quick_start.sh`
11. ✅ `truthlens-backend/quick_start.bat`
12. ✅ `truthlens-backend/test_gemini.py`
13. ✅ `truthlens-backend/test_services.py`

#### Frontend:
14. ✅ `Frontend/src/services/api.ts`
    - Comment: "API Service for Credence Backend"

---

## Folder Rename Required

**IMPORTANT**: The backend folder needs to be renamed manually:

### Steps to Rename Folder:

1. **Stop the backend server** (if running):
   - Press `Ctrl+C` in the terminal running the backend

2. **Rename the folder**:
   ```bash
   # On Windows (PowerShell):
   Rename-Item -Path "truthlens-backend" -NewName "credence-backend"
   
   # On Mac/Linux:
   mv truthlens-backend credence-backend
   ```

3. **Update any scripts/shortcuts** that reference the old folder name

4. **Restart the backend**:
   ```bash
   cd credence-backend
   python main.py
   ```

---

## Database File

The database file will be automatically created as `credence.db` (instead of `truthlens.db`) when you restart the backend.

If you want to keep your existing data:
```bash
# Copy the old database to the new name
cp truthlens.db credence.db
```

---

## API Responses

The API now returns:
```json
{
  "status": "Credence API is running",
  "service": "Credence API"
}
```

---

## Gemini Prompt

Gemini now introduces itself as:
```
"You are Credence, an expert fact-checking and media integrity AI analyst..."
```

---

## Summary

✅ All code references updated from "TruthLens" to "Credence"
✅ Database renamed to `credence.db`
✅ API name changed to "Credence API"
✅ Gemini identity updated to "Credence"
⚠️ **Manual step required**: Rename `truthlens-backend` folder to `credence-backend`

---

## Testing

After renaming the folder, test that everything works:

```bash
# 1. Start backend
cd credence-backend
python main.py

# 2. Check health endpoint
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"Credence API"}

# 3. Start frontend
cd Frontend
npm run dev

# 4. Test analysis
# Go to http://localhost:5173 and try analyzing some text
```

---

**Status**: ✅ Code updated, folder rename pending (requires manual step)
