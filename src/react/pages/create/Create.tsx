import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import './create.css';
import axios, { isAxiosError } from "axios";
import { Controller, useForm } from 'react-hook-form';
import { Dayjs } from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';


interface IFormData {
  caption: string;
  file: File | null;
}

const Create = () => {
  const [image, setImage] = useState<File | null>(null);
  const [length, setLength] = useState<Dayjs | null>(null);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset: clearForm,
    resetField,
  } = useForm<IFormData>({ mode: 'onChange' });

  const handleFormSubmit = async (data: IFormData) => {
    const formData = new FormData();
    formData.append("caption", data.caption);
    formData.append("file", image as Blob);
    length && formData.append("deadline", length.toISOString());
    clearForm();
    try {
      await axios.post('/battle/new', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate('/');
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  const handleClearImage = () => {
    setImage(null);
    resetField('file');
  }

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    setImage(file);
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files.item(0);
    setImage(file);
  }

  return (
    <React.Fragment>
      <Paper elevation={0} sx={{ mt: 4, width: '800px' }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={2}>
            <Typography variant="h3" color="#FFF">
              Create a war
            </Typography>

            <Controller
              name="caption"
              control={control}
              defaultValue=""
              rules={{
                required: 'Caption required'
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  error={!!error}
                  helperText={error ? error.message : null}
                  fullWidth
                  id="outlined-basic"
                  label="Photo caption"
                  variant="outlined"
                  {...field}
                />
              )}
            />

            {image ? (
              <React.Fragment>
                <Box sx={{ my: 2 }}>
                  <img src={URL.createObjectURL(image)} className="image-preview" />
                </Box>

                <Box display="flex" justifyContent="flex-end">
                  <Button
                    onClick={handleClearImage}
                    sx={{ width: '10px' }}
                    variant="outlined"
                    color="info"
                  >
                    Clear
                  </Button>
                </Box>
              </React.Fragment>
            ) : (
              <Controller
                name="file"
                control={control}
                defaultValue={null}
                rules={{
                  validate: {
                    imageExists: value => !!value || 'Please upload an image.'
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <React.Fragment>
                    <Box
                      onDrop={handleImageDrop}
                      onDragOver={(event) => event.preventDefault()}
                      sx={{ border: '1px dashed grey' }}
                      {...field}
                    >
                      <Stack
                        sx={{ height: "300px" }}
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <label htmlFor="image-upload">
                          Drag and drop an image, or
                        </label>
                        <Button
                          variant="outlined"
                          component="label"
                          color="info"
                          sx={{ ml: 1 }}>
                          Upload File
                          <input
                            type="file"
                            hidden
                            id="image-upload"
                            accept="image/*"
                            name="image"
                            onChange={handleImageChange}
                          />
                        </Button>
                      </Stack>
                    </Box>
                    <FormHelperText error={!!error}>
                      {error ? error.message : ''}
                    </FormHelperText>
                  </React.Fragment>
                )}
              />
            )}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker label="Deadline"
            disableOpenPicker={false}
            disablePast={true}
            value={length}
            onChange={(value) => {
              setLength(value);
            }}
          />
          </LocalizationProvider>
            {/* <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={length}
          label="Length"
          onChange={(event) => setLength(event.target.value as string)}
        >
          <MenuItem value={12}>12 hours</MenuItem>
          <MenuItem value={24}>24 hours</MenuItem>
          <MenuItem value={48}>48 hours</MenuItem>
        </Select> */}
          </Stack>
          <Button
              variant="contained"
              type="submit"
              sx={{ mt: 2 }}
            >
              Create
            </Button>
        </form>
      </Paper>
    </React.Fragment>
  );
};

export { Create };
