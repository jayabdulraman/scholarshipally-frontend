'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import { useMediaQuery } from "@/lib/hooks/useMediaQuery"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconPlus } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { saveScholarship } from '@/app/actions'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(150, "Description must not exceed 150 words"),
  eligibility: z.string().max(150, "Eligibility must not exceed 150 words"),
  fundingValue: z.string().min(1, "Value is required"),
  academicFields: z.array(z.string()).min(1, "At least one field must be selected"),
  deadline: z.string().min(1, "Deadline is required"),
  website: z.string().url("Invalid URL"),
  hostCountry: z.array(z.string()).min(1, "At least one host country must be selected"),
});

type FormData = z.infer<typeof formSchema>;

export function SubmitFunding() {
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className='className="hidden ml-2 md:flex"'>
                    <IconPlus />
                    <span className="ml-2">Submit scholarship</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Submit scholarship</DialogTitle>
                    <DialogDescription>
                        Help submit funding resources for prospective students.
                    </DialogDescription>
                </DialogHeader>
                <ScholarshipForm />
            </DialogContent>
        </Dialog>
      )
    }
    
    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" className='className="hidden ml-2 md:flex"'>
                    <IconPlus />
                    <span className="ml-2">Submit scholarship</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent className='overflow-y-scroll'>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Submit scholarship</DrawerTitle>
                    <DrawerDescription>
                        Help submit funding resources for prospective students.
                    </DrawerDescription>
                </DrawerHeader>
                <ScholarshipForm />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

const ScholarshipForm: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      eligibility: '',
      fundingValue: '',
      academicFields: [],
      deadline: '',
      website: '',
      hostCountry: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/scholarship/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit scholarship');
      }

      toast.success('Scholarship submitted successfully!');
      console.log("Scholarship Saved!")
    } catch (error) {
      toast.error('Error submitting scholarship. Please try again.');
    }
  };

  const countries = [
    {value: "United States of America", label: "USA"}, 
    {value: "United Kingdom", label: "UK"}, 
    {value: "Canada", label: "Canada"}, 
    {value: "Australia", label: "Australia"}, 
    {value: "Germany", label: "Germany"}, 
    {value: "France", label: "France"}, 
    {value: "Japan", label: "Japan"}, {value: "China", label: "China"},
    {value: "India", label: "India"}
  ];
  
  const educationalFields = [
    { value: "All", label: "All" },
    { value: "Business", label: "Business" },
    { value: "Computer Science", label: "Computer Science" },
    { value: "Accounting", label: "Accounting" },
    { value: "Medicine", label: "Medicine" },
    { value: "Public Health", label: "Public Health" },
    { value: "Social Science", label: "Social Science" },
    { value: "Engineering", label: "Engineering" },
    { value: "Arts", label: "Arts" },
    { value: "Humanities", label: "Humanities" },
    { value: "Natural Sciences", label: "Natural Sciences" },
    { value: "Law", label: "Law" },
  ];

  return (
    <Form {...control}>
    <form onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fundingValue">Value *</Label>
            <Controller
              name="fundingValue"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.fundingValue && <p className="text-red-500">{errors.fundingValue.message}</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea {...field} />}
            />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="eligibility">Eligibility *</Label>
            <Controller
              name="eligibility"
              control={control}
              render={({ field }) => <Textarea {...field} />}
            />
            {errors.eligibility && <p className="text-red-500">{errors.eligibility.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FormField
              name="academicFields"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Academic Fields *</FormLabel>
                  <MultiSelect
                    selected={[field.value]}
                    options={educationalFields}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {errors.academicFields && <p className="text-red-500">{errors.academicFields.message}</p>}
          </div>
          <div className="space-y-2">
            <FormField
              name="hostCountry"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Host Countries *</FormLabel>
                  <MultiSelect
                    selected={[field.value]}
                    options={countries}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {errors.hostCountry && <p className="text-red-500">{errors.hostCountry.message}</p>}
          </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline *</Label>
          <Controller
            name="deadline"
            control={control}
            render={({ field }) => <Input type="date" {...field} />}
          />
          {errors.deadline && <p className="text-red-500">{errors.deadline.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website *</Label>
          <Controller
            name="website"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
          {errors.website && <p className="text-red-500">{errors.website.message}</p>}
        </div>
      </div>

      <Button type="submit">Submit Scholarship</Button>
    </form>
    </Form>
  );
};
