"use client"
import { createPackage } from "@/server/Packages/pushActions";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Package name is required")
    .max(50, "Name must be less than 50 characters"),
  price: z
    .number()
    .min(1, "Price must be greater than 0")
    .max(1000000, "Price must be less than 1,000,000"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  pavilionId: z.number().min(1, "Please select a pavilion"),
  includePool: z.boolean(),
});
const AddPackageDialog = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: pavilionsData } = useQuery({
    queryKey: ["allPavilions"],
    queryFn: () => getAllPavilions(),
  });

  const createPackageMutation = useMutation({
    mutationKey: ["create-package"],
    mutationFn: (data: {
      name: string;
      price: number;
      description: string;
      pavilionId: number;
      includePool: boolean;
    }) => createPackage(data.name, data.price, data.description, data.pavilionId, data.includePool),
    onSuccess: () => {
      // Invalidate and refetch packages data
      queryClient.invalidateQueries({ queryKey: ["allPackages"] });
      form.reset();
      setIsDialogOpen(false);
      toast.success("Package created successfully!");
    },
    onError: error => {
      console.error("Failed to create package:", error);
      toast.error("Failed to create package. Please try again.");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      pavilionId: 0,
      includePool: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    createPackageMutation.mutate(values);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <CirclePlus /> Add New Package
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="mb-4">Add new package</DialogTitle>
          <DialogDescription>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" placeholder="Premium Package" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="50000"
                            min="0"
                            step="0.01"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Package description..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pavilionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pavilion</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={value => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select pavilion" />
                            </SelectTrigger>
                            <SelectContent>
                              {pavilionsData?.length ? (
                                pavilionsData.map(pavilion => (
                                  <SelectItem value={String(pavilion.id)} key={pavilion.id}>
                                    {pavilion.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>
                                  No pavilions available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includePool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Include Pool Access</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? "true" : "false"}
                            onValueChange={value => field.onChange(value === "true")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Yes/No" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <DialogClose>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={createPackageMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button type="submit" disabled={createPackageMutation.isPending}>
                    {createPackageMutation.isPending ? "Creating..." : "Create Package"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddPackageDialog;
