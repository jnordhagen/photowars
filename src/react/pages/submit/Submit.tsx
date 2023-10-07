import * as React from 'react';
import { useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

interface IFormData {
  caption: string;
  file: File | null;
}

const Submit = () => {
  const { battleId } = useParams<'battleId'>();
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset: clearForm,
    resetField
  } = useForm<IFormData>();

  const submitForm = async (data: IFormData) => {
    const path = `/battle/${battleId}/submit`;
    const form = new FormData();
    form.append('caption', data.caption);
    form.append('file', image as Blob);
    clearForm();
    try {
      await axios.post(path, form);
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
    navigate('..');
  }

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
      <Paper elevation={0} sx={{ mt: 4 }}>
        <form onSubmit={handleSubmit(submitForm)}>
          <Stack spacing={2}>
            <Typography variant="h6">
              Enter a submission
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
                  inputProps={{ maxLength: 60 }}
                  {...field}
                />
              )}
            />

        {image ?
           <React.Fragment>
           <Box
             component="img"
             src={URL.createObjectURL(image)}
             sx={{
               border: "1px solid grey",
               width: '100%'
             }}
           />
           <Box display="flex" justifyContent="flex-end">
             <Button
               onClick={handleClearImage}
               sx={{ width: '10px' }}
               variant="outlined"
             >
               Clear
             </Button>
           </Box>
           </React.Fragment>
         :
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
                        sx={{ height: "200px" }}
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <label>
                          {'Drag and drop an image, or '}
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
            }
          </Stack>
          <Button
            variant="contained"
            type="submit"
          >
            Post
          </Button>
        </form>
      </Paper>
    </React.Fragment>
  );
};

export { Submit };
