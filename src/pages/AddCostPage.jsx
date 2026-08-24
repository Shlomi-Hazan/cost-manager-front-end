import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { COMMON_CATEGORIES } from "../constants/categories.js";
import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";
import { costsDatabase } from "../lib/costsDatabase.js";
import { normalizeCategoryInput } from "../utils/category.js";

const initialFormValues = {
  sum: "",
  currency: "USD",
  category: "",
  description: ""
};

function validateForm(values) {
  const nextErrors = {};
  const trimmedSum = values.sum.trim();
  const numericSum = Number(trimmedSum);
  const normalizedCategory = normalizeCategoryInput(values.category);

  if (trimmedSum === "") {
    nextErrors.sum = "Enter a cost sum.";
  } else if (!Number.isFinite(numericSum)) {
    nextErrors.sum = "Enter a valid numeric sum.";
  }

  if (!SUPPORTED_CURRENCIES.includes(values.currency)) {
    nextErrors.currency = "Select a supported currency.";
  }

  if (normalizedCategory === "") {
    nextErrors.category = "Enter a category.";
  }

  if (values.description.trim() === "") {
    nextErrors.description = "Enter a description.";
  }

  return {
    errors: nextErrors,
    isValid: Object.keys(nextErrors).length === 0,
    normalizedCategory,
    numericSum
  };
}

function AddCostPage() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined
    }));
    setFeedback(null);
  }

  function handleCategoryChange(_event, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      category: value ?? ""
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      category: undefined
    }));
    setFeedback(null);
  }

  function handleCategoryInputChange(_event, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      category: value
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      category: undefined
    }));
    setFeedback(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validation = validateForm(formValues);

    setErrors(validation.errors);

    if (!validation.isValid) {
      setFeedback({
        severity: "error",
        message: "Please correct the highlighted fields."
      });
      return;
    }

    try {
      costsDatabase.addCost({
        sum: validation.numericSum,
        currency: formValues.currency,
        category: validation.normalizedCategory,
        description: formValues.description.trim()
      });

      setFormValues(initialFormValues);
      setFeedback({
        severity: "success",
        message: "Cost added successfully."
      });
    } catch {
      setFeedback({
        severity: "error",
        message: "Could not add cost. Please try again."
      });
    }
  }

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h1">
        Add Cost
      </Typography>
      <Typography color="text.secondary" variant="body1">
        Enter a cost item and save it to your Cost Manager database.
      </Typography>

      <Paper
        component="form"
        elevation={0}
        onSubmit={handleSubmit}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          maxWidth: 720,
          p: 3
        }}
      >
        <Stack spacing={3}>
          {feedback ? (
            <Alert severity={feedback.severity}>{feedback.message}</Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "minmax(0, 1fr) 180px"
              }
            }}
          >
            <TextField
              error={Boolean(errors.sum)}
              helperText={errors.sum ?? "Use a numeric value."}
              inputMode="decimal"
              label="Sum"
              name="sum"
              onChange={handleChange}
              value={formValues.sum}
            />
            <TextField
              error={Boolean(errors.currency)}
              helperText={errors.currency ?? " "}
              label="Currency"
              name="currency"
              onChange={handleChange}
              select
              value={formValues.currency}
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Autocomplete
            freeSolo
            inputValue={formValues.category}
            onChange={handleCategoryChange}
            onInputChange={handleCategoryInputChange}
            openOnFocus
            options={COMMON_CATEGORIES}
            renderInput={(params) => (
              <TextField
                {...params}
                error={Boolean(errors.category)}
                helperText={errors.category ?? "Choose a suggestion or type a custom category."}
                label="Category"
                name="category"
              />
            )}
          />

          <TextField
            error={Boolean(errors.description)}
            helperText={errors.description ?? "The date will be added automatically."}
            label="Description"
            multiline
            name="description"
            onChange={handleChange}
            rows={3}
            value={formValues.description}
          />

          <Box>
            <Button type="submit" variant="contained">
              Add Cost
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default AddCostPage;
