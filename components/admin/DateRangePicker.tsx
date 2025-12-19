import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Divider,
  TextField
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presetRanges = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      label: 'Last 7 days'
    })
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      label: 'Last 30 days'
    })
  },
  {
    label: 'Last 90 days',
    getValue: () => ({
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      label: 'Last 90 days'
    })
  },
  {
    label: 'This month',
    getValue: () => {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: now,
        label: 'This month'
      };
    }
  },
  {
    label: 'Last month',
    getValue: () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: lastMonth,
        endDate: lastMonthEnd,
        label: 'Last month'
      };
    }
  },
  {
    label: 'This year',
    getValue: () => {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: now,
        label: 'This year'
      };
    }
  }
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCustomMode(false);
  };

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    onChange(preset.getValue());
    handleClose();
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange({
        startDate: new Date(customStart),
        endDate: new Date(customEnd),
        label: 'Custom range'
      });
      handleClose();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarIcon />}
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          borderColor: 'divider',
          color: 'text.primary',
          fontWeight: 500,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        {value.label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 280, mt: 1 }
        }}
      >
        {!customMode ? (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                QUICK SELECT
              </Typography>
            </Box>
            {presetRanges.map((preset) => (
              <MenuItem
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                selected={value.label === preset.label}
              >
                {preset.label}
              </MenuItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => setCustomMode(true)}>
              Custom range...
            </MenuItem>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Custom Date Range
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setCustomMode(false)}>
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                >
                  Apply
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Menu>
    </>
  );
}
