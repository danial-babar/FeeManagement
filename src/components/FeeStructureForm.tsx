import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

interface Installment {
  label: string;
  amount: number;
  dueDate: string;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  totalAmount: Yup.number()
    .required('Total amount is required')
    .min(0, 'Amount must be positive'),
  academicYear: Yup.string().required('Academic year is required'),
  applicableClasses: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one class must be selected'),
  installments: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required('Label is required'),
        amount: Yup.number()
          .required('Amount is required')
          .min(0, 'Amount must be positive'),
        dueDate: Yup.string().required('Due date is required'),
      })
    )
    .min(1, 'At least one installment is required'),
});

export default function FeeStructureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      totalAmount: 0,
      academicYear: '',
      applicableClasses: [],
      installments: [
        {
          label: '',
          amount: 0,
          dueDate: '',
        },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        await axios.post('/api/fee-structures/create', values);
        toast({
          title: 'Fee structure created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        formik.resetForm();
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error creating fee structure',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const addInstallment = () => {
    formik.setFieldValue('installments', [
      ...formik.values.installments,
      { label: '', amount: 0, dueDate: '' },
    ]);
  };

  const removeInstallment = (index: number) => {
    const installments = [...formik.values.installments];
    installments.splice(index, 1);
    formik.setFieldValue('installments', installments);
  };

  return (
    <Box as="form" onSubmit={formik.handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl
          isInvalid={formik.touched.title && Boolean(formik.errors.title)}
        >
          <FormLabel>Title</FormLabel>
          <Input
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
          />
        </FormControl>

        <FormControl
          isInvalid={
            formik.touched.totalAmount && Boolean(formik.errors.totalAmount)
          }
        >
          <FormLabel>Total Amount</FormLabel>
          <Input
            type="number"
            name="totalAmount"
            value={formik.values.totalAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </FormControl>

        <FormControl
          isInvalid={
            formik.touched.academicYear && Boolean(formik.errors.academicYear)
          }
        >
          <FormLabel>Academic Year</FormLabel>
          <Input
            name="academicYear"
            value={formik.values.academicYear}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </FormControl>

        <FormControl
          isInvalid={
            formik.touched.applicableClasses &&
            Boolean(formik.errors.applicableClasses)
          }
        >
          <FormLabel>Applicable Classes</FormLabel>
          <Select
            multiple
            value={formik.values.applicableClasses}
            onChange={(e) => {
              const options = e.target.options;
              const values = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  values.push(options[i].value);
                }
              }
              formik.setFieldValue('applicableClasses', values);
            }}
          >
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="4">Class 4</option>
            <option value="5">Class 5</option>
          </Select>
        </FormControl>

        <Box>
          <FormLabel>Installments</FormLabel>
          <VStack spacing={4} align="stretch">
            {formik.values.installments.map((installment, index) => (
              <HStack key={index} spacing={4}>
                <FormControl
                  isInvalid={
                    formik.touched.installments?.[index]?.label &&
                    Boolean(formik.errors.installments?.[index]?.label)
                  }
                >
                  <Input
                    placeholder="Label"
                    name={`installments.${index}.label`}
                    value={installment.label}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormControl>

                <FormControl
                  isInvalid={
                    formik.touched.installments?.[index]?.amount &&
                    Boolean(formik.errors.installments?.[index]?.amount)
                  }
                >
                  <Input
                    type="number"
                    placeholder="Amount"
                    name={`installments.${index}.amount`}
                    value={installment.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormControl>

                <FormControl
                  isInvalid={
                    formik.touched.installments?.[index]?.dueDate &&
                    Boolean(formik.errors.installments?.[index]?.dueDate)
                  }
                >
                  <Input
                    type="date"
                    name={`installments.${index}.dueDate`}
                    value={installment.dueDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </FormControl>

                <IconButton
                  aria-label="Remove installment"
                  icon={<DeleteIcon />}
                  onClick={() => removeInstallment(index)}
                  isDisabled={formik.values.installments.length === 1}
                />
              </HStack>
            ))}

            <Button
              leftIcon={<AddIcon />}
              onClick={addInstallment}
              variant="outline"
            >
              Add Installment
            </Button>
          </VStack>
        </Box>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          isDisabled={!formik.isValid}
        >
          Create Fee Structure
        </Button>
      </VStack>
    </Box>
  );
} 