# API Reference — Tayebat (Eltayebat)

Base URL (local): `http://localhost:3000`  
All protected routes require an `Authorization: Bearer <token>` header.

---

## Authentication

### POST `/api/auth/register`

Create a new user account.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "name": "Jane Doe"
}
```

**Response `201`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe"
  }
}
```

---

### POST `/api/auth/login`

Sign in with email and password.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "email": "user@example.com", "name": "Jane Doe" }
}
```

---

### POST `/api/auth/logout` 🔒

Invalidate the current session.

**Response `200`:**
```json
{ "message": "Logged out successfully" }
```

---

## Health

### GET `/api/health`

Check that the server is running.

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-23T00:00:00.000Z"
}
```

---

## Dashboard

### GET `/api/dashboard` 🔒

Returns the authenticated user's daily summary.

**Response `200`:**
```json
{
  "today": {
    "calories": 1650,
    "protein": 82,
    "carbs": 190,
    "fat": 55,
    "entries": 4
  },
  "goals": {
    "calories": 2000,
    "protein": 120,
    "carbs": 220,
    "fat": 65
  },
  "streak": 7
}
```

---

## Food Tracker

### GET `/api/tracker` 🔒

Get food log entries for a date range.

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `date` | `string` | today | `YYYY-MM-DD` |
| `from` | `string` | — | Range start |
| `to` | `string` | — | Range end |

**Response `200`:**
```json
[
  {
    "id": 1,
    "date": "2026-07-23",
    "mealType": "breakfast",
    "food": { "id": 10, "name": "Oats", "calories": 150, "protein": 5, "carbs": 27, "fat": 2.5 },
    "quantity": 1,
    "unit": "serving"
  }
]
```

---

### POST `/api/tracker` 🔒

Log a food entry.

**Request body:**
```json
{
  "foodId": 10,
  "date": "2026-07-23",
  "mealType": "breakfast",
  "quantity": 1,
  "unit": "serving"
}
```

**Response `201`:** Created tracker entry.

---

### DELETE `/api/tracker/:id` 🔒

Remove a tracker entry.

**Response `200`:**
```json
{ "message": "Entry deleted" }
```

---

## Foods

### GET `/api/foods` 🔒

Search the food database.

**Query params:** `?search=oats&limit=20&offset=0`

**Response `200`:**
```json
[
  { "id": 10, "name": "Oats", "calories": 150, "protein": 5, "carbs": 27, "fat": 2.5 }
]
```

---

### POST `/api/foods` 🔒

Add a custom food.

**Request body:**
```json
{
  "name": "My Protein Shake",
  "calories": 180,
  "protein": 25,
  "carbs": 8,
  "fat": 3
}
```

**Response `201`:** Created food object.

---

## Meal Plans

### GET `/api/plans` 🔒

List all meal plans for the authenticated user.

**Response `200`:** Array of plan objects.

---

### POST `/api/plans` 🔒

Create a new meal plan.

**Request body:**
```json
{
  "name": "Summer Cut",
  "startDate": "2026-07-01",
  "endDate": "2026-07-31",
  "targetCalories": 1800
}
```

**Response `201`:** Created plan object.

---

### GET `/api/plans/:id` 🔒

Get a single meal plan with its days and meals.

---

### PUT `/api/plans/:id` 🔒

Update a meal plan.

---

### DELETE `/api/plans/:id` 🔒

Delete a meal plan.

---

## Recipes

### GET `/api/recipes` 🔒

List all recipes.

**Query params:** `?search=chicken&limit=20&offset=0`

---

### POST `/api/recipes` 🔒

Create a recipe.

**Request body:**
```json
{
  "name": "Grilled Chicken Bowl",
  "description": "High protein lunch",
  "servings": 2,
  "ingredients": [
    { "foodId": 5, "quantity": 200, "unit": "g" }
  ],
  "instructions": "1. Grill chicken..."
}
```

---

### GET `/api/recipes/:id` 🔒

Get a single recipe with ingredients and nutrition totals.

---

### DELETE `/api/recipes/:id` 🔒

Delete a recipe (owner only).

---

## Profile

### GET `/api/profile` 🔒

Get the authenticated user's profile.

**Response `200`:**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "user@example.com",
  "age": 28,
  "weight": 65,
  "height": 168,
  "goal": "lose_weight",
  "activityLevel": "moderate"
}
```

---

### PUT `/api/profile` 🔒

Update profile information.

**Request body:** Any subset of profile fields.

---

## Error Responses

All errors follow this shape:

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

| Status | Meaning |
|---|---|
| `400` | Validation error (Zod) |
| `401` | Missing / invalid JWT |
| `403` | Forbidden (not owner) |
| `404` | Resource not found |
| `409` | Conflict (e.g. email taken) |
| `500` | Internal server error |
