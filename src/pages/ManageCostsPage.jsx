import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import PageHeader from "../components/common/PageHeader.jsx";
import SectionCard from "../components/common/SectionCard.jsx";
import { COMMON_CATEGORIES } from "../constants/categories.js";
import { SUPPORTED_CURRENCIES } from "../constants/currencies.js";
import { costsDatabase } from "../lib/costsDatabase.js";
import { normalizeCategoryInput } from "../utils/category.js";
import {
  formatDateForDisplay,
  formatDateForInput,
  formatTime,
  parseDateInput,
  parseTimeInput
} from "../utils/dateTime.js";
import { formatDisplayAmount } from "../utils/amountFormat.js";

/*
 * TEAM EXTENSION (X-002/X-003): lets the user view, edit, and delete
 * existing costs, none of which the official specification requires — it
 * only requires that costs can be added. This screen relies entirely on
 * db.js's id-based getAllCosts/updateCost/deleteCost extensions (see
 * src/lib/db.js); it never touches localStorage directly, and never edits
 * the auto-generated id.
 */

// Converts a stored cost's raw fields into the shape the edit dialog's form
// controls expect (all-string sum, HTML date/time input formats).
function createEditValues(cost) {
  return {
    sum: String(cost.sum),
    currency: cost.currency,
    category: cost.category,
    description: cost.description,
    date: formatDateForInput(cost.date),
    time: formatTime(cost.date)
  };
}

function validateEditValues(values) {
  const errors = {};
  const trimmedSum = values.sum.trim();
  const numericSum = Number(trimmedSum);
  const normalizedCategory = normalizeCategoryInput(values.category);
  const trimmedDescription = values.description.trim();
  const parsedDate = parseDateInput(values.date.trim());
  const parsedTime = parseTimeInput(values.time.trim());

  if (trimmedSum === "") {
    errors.sum = "Enter a cost sum.";
  } else if (!Number.isFinite(numericSum)) {
    errors.sum = "Enter a valid numeric sum.";
  }

  if (!SUPPORTED_CURRENCIES.includes(values.currency)) {
    errors.currency = "Select a supported currency.";
  }

  if (normalizedCategory === "") {
    errors.category = "Enter a category.";
  }

  if (trimmedDescription === "") {
    errors.description = "Enter a description.";
  }

  if (values.date.trim() === "") {
    errors.date = "Enter a date.";
  } else if (parsedDate === null) {
    errors.date = "Enter a date in YYYY-MM-DD format.";
  }

  if (values.time.trim() === "") {
    errors.time = "Enter a time.";
  } else if (parsedTime === null) {
    errors.time = "Enter a time in HH:mm format.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    normalizedCategory,
    numericSum,
    parsedDate,
    parsedTime,
    trimmedDescription
  };
}

function getDatabaseErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message.includes("real calendar date")) {
    return "Enter a real calendar date.";
  }

  return fallbackMessage;
}

function ManageCostsPage() {
  const [costs, setCosts] = useState(() => costsDatabase.getAllCosts());
  const [feedback, setFeedback] = useState(null);
  const [editCost, setEditCost] = useState(null);
  const [editValues, setEditValues] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editFeedback, setEditFeedback] = useState("");
  const [deleteCost, setDeleteCost] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState("");

  function loadCosts() {
    setCosts(costsDatabase.getAllCosts());
  }

  function handleOpenEdit(cost) {
    setEditCost(cost);
    setEditValues(createEditValues(cost));
    setEditErrors({});
    setEditFeedback("");
    setFeedback(null);
  }

  function handleCloseEdit() {
    setEditCost(null);
    setEditValues(null);
    setEditErrors({});
    setEditFeedback("");
  }

  function handleEditFieldChange(event) {
    const { name, value } = event.target;

    setEditValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
    setEditErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined
    }));
    setEditFeedback("");
  }

  function handleCategoryChange(_event, value) {
    setEditValues((currentValues) => ({
      ...currentValues,
      category: value ?? ""
    }));
    setEditErrors((currentErrors) => ({
      ...currentErrors,
      category: undefined
    }));
    setEditFeedback("");
  }

  function handleCategoryInputChange(_event, value) {
    setEditValues((currentValues) => ({
      ...currentValues,
      category: value
    }));
    setEditErrors((currentErrors) => ({
      ...currentErrors,
      category: undefined
    }));
    setEditFeedback("");
  }

  function handleSaveEdit(event) {
    event.preventDefault();
    setEditFeedback("");

    const validation = validateEditValues(editValues);

    setEditErrors(validation.errors);

    if (!validation.isValid) {
      setEditFeedback("Could not update cost. Please review the fields and try again.");
      return;
    }

    try {
      // updateCost() preserves editCost.id — this can only ever change the
      // sum/currency/category/description/date of that specific row.
      const updatedCost = costsDatabase.updateCost(editCost.id, {
        sum: validation.numericSum,
        currency: editValues.currency,
        category: validation.normalizedCategory,
        description: validation.trimmedDescription,
        date: {
          ...validation.parsedDate,
          ...validation.parsedTime
        }
      });

      loadCosts();

      // A null result means the id no longer exists (e.g. deleted from
      // another tab) — not a validation failure, so this refreshes the
      // list and tells the user what happened rather than showing a form
      // error.
      if (updatedCost === null) {
        handleCloseEdit();
        setFeedback({
          severity: "warning",
          message: "This cost no longer exists. The list has been refreshed."
        });
        return;
      }

      handleCloseEdit();
      setFeedback({
        severity: "success",
        message: "Cost updated successfully."
      });
    } catch (error) {
      const message = getDatabaseErrorMessage(
        error,
        "Could not update cost. Please review the fields and try again."
      );

      setEditFeedback(message);
    }
  }

  function handleOpenDelete(cost) {
    setDeleteCost(cost);
    setDeleteFeedback("");
    setFeedback(null);
  }

  function handleCloseDelete() {
    setDeleteCost(null);
    setDeleteFeedback("");
  }

  function handleConfirmDelete() {
    setDeleteFeedback("");

    try {
      const deletedCost = costsDatabase.deleteCost(deleteCost.id);

      loadCosts();
      handleCloseDelete();

      if (deletedCost === null) {
        setFeedback({
          severity: "warning",
          message: "This cost no longer exists. The list has been refreshed."
        });
        return;
      }

      setFeedback({
        severity: "success",
        message: "Cost deleted successfully."
      });
    } catch {
      setDeleteFeedback("Could not delete cost. Please try again.");
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Manage Costs">
        Review, edit, or delete your saved expenses.
      </PageHeader>

      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

      {costs.length === 0 ? (
        <Alert icon={<InboxOutlinedIcon aria-hidden="true" />} severity="info">
          No costs have been added yet. Add costs from the Add Cost section.
        </Alert>
      ) : (
        <SectionCard sx={{ p: 0 }}>
          <TableContainer>
            <Table aria-label="Saved costs">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Sum</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costs.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{formatDateForDisplay(cost.date)}</TableCell>
                    <TableCell>{formatTime(cost.date)}</TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>{cost.category}</TableCell>
                    <TableCell align="right">
                      {formatDisplayAmount(cost.sum)}
                    </TableCell>
                    <TableCell>{cost.currency}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: "flex-end" }}
                      >
                        <Button
                          onClick={() => handleOpenEdit(cost)}
                          size="small"
                          startIcon={<EditOutlinedIcon aria-hidden="true" />}
                        >
                          Edit
                        </Button>
                        <Button
                          color="error"
                          onClick={() => handleOpenDelete(cost)}
                          size="small"
                          startIcon={<DeleteOutlineIcon aria-hidden="true" />}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={handleCloseEdit}
        open={Boolean(editCost && editValues)}
        transitionDuration={0}
      >
        <Box component="form" onSubmit={handleSaveEdit}>
          <DialogTitle>Edit Cost</DialogTitle>
          <DialogContent dividers>
            {editValues ? (
              <Stack spacing={3} sx={{ pt: 1 }}>
                {editFeedback ? (
                  <Alert severity="error">{editFeedback}</Alert>
                ) : null}

                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "minmax(0, 1fr) 160px"
                    }
                  }}
                >
                  <TextField
                    error={Boolean(editErrors.sum)}
                    helperText={editErrors.sum ?? "Use a numeric value."}
                    inputMode="decimal"
                    label="Sum"
                    name="sum"
                    onChange={handleEditFieldChange}
                    value={editValues.sum}
                  />
                  <TextField
                    error={Boolean(editErrors.currency)}
                    helperText={editErrors.currency ?? " "}
                    label="Currency"
                    name="currency"
                    onChange={handleEditFieldChange}
                    select
                    value={editValues.currency}
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
                  inputValue={editValues.category}
                  onChange={handleCategoryChange}
                  onInputChange={handleCategoryInputChange}
                  openOnFocus
                  options={COMMON_CATEGORIES}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(editErrors.category)}
                      helperText={
                        editErrors.category ??
                        "Choose a suggestion or type a custom category."
                      }
                      label="Category"
                      name="category"
                    />
                  )}
                />

                <TextField
                  error={Boolean(editErrors.description)}
                  helperText={editErrors.description ?? " "}
                  label="Description"
                  multiline
                  name="description"
                  onChange={handleEditFieldChange}
                  rows={3}
                  value={editValues.description}
                />

                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "minmax(0, 1fr) minmax(0, 1fr)"
                    }
                  }}
                >
                  <TextField
                    error={Boolean(editErrors.date)}
                    helperText={editErrors.date ?? " "}
                    label="Date"
                    name="date"
                    onChange={handleEditFieldChange}
                    slotProps={{
                      inputLabel: {
                        shrink: true
                      }
                    }}
                    type="date"
                    value={editValues.date}
                  />
                  <TextField
                    error={Boolean(editErrors.time)}
                    helperText={editErrors.time ?? " "}
                    label="Time"
                    name="time"
                    onChange={handleEditFieldChange}
                    slotProps={{
                      inputLabel: {
                        shrink: true
                      }
                    }}
                    type="time"
                    value={editValues.time}
                  />
                </Box>
              </Stack>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        onClose={handleCloseDelete}
        open={Boolean(deleteCost)}
        transitionDuration={0}
      >
        <DialogTitle>Delete cost?</DialogTitle>
        <DialogContent dividers>
          {deleteCost ? (
            <Stack spacing={1}>
              {deleteFeedback ? (
                <Alert severity="error">{deleteFeedback}</Alert>
              ) : null}

              <Typography>
                Are you sure you want to delete this cost? This action cannot be
                undone.
              </Typography>
              <Typography>
                Description: <strong>{deleteCost.description}</strong>
              </Typography>
              <Typography>
                Category: <strong>{deleteCost.category}</strong>
              </Typography>
              <Typography>
                Sum:{" "}
                <strong>
                  {formatDisplayAmount(deleteCost.sum)} {deleteCost.currency}
                </strong>
              </Typography>
              <Typography>
                Date: <strong>{formatDateForDisplay(deleteCost.date)}</strong>
              </Typography>
              <Typography>
                Time: <strong>{formatTime(deleteCost.date)}</strong>
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default ManageCostsPage;
