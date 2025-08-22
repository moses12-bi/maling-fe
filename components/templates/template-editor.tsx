'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { Plus, X, Code, Eye, Save, ArrowLeft } from 'lucide-react';
import { EmailTemplate, TemplateVariable } from '@/types/template';
import { templateAPI } from '@/lib/api/template';
import { toast } from 'sonner';
import { generateEmail } from '@/lib/email/templates';

// Variable type union
type VariableType = 'text' | 'number' | 'date' | 'select' | 'boolean';

interface VariableOption {
  label: string;
  value: string;
}

// Schemas
const variableSchema = z.object({
  name: z.string().min(1, 'Variable name is required'),
  type: z.enum(['text', 'number', 'date', 'select', 'boolean']),
  required: z.boolean().default(false),
  description: z.string().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  variables: z.array(variableSchema),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateEditorProps {
  template?: EmailTemplate;
  categories: { id: string; name: string }[];
  onSave?: (template: EmailTemplate) => void;
  onCancel?: () => void;
  isSubmitting?: boolean; // external (prop) loading, if any
}

export default function TemplateEditor({
  template,
  categories,
  onSave,
  onCancel,
  isSubmitting: isSubmittingProp = false,
}: TemplateEditorProps) {
  const router = useRouter();

  // Use 'editor' / 'preview' only
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name ?? '',
      description: template?.description ?? '',
      category: template?.category ?? '',
      subject: template?.subject ?? '',
      body: template?.body ?? '',
      variables: template?.variables ?? [],
      tags: template?.tags ?? [],
      isActive: template?.isActive ?? true,
    },
  });

  const watchedBody = watch('body');
  const watchedVariables = watch('variables');

  // Local submit loading (separate from prop)
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update preview when template content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedBody, watchedVariables, previewData]);

  const updatePreview = async () => {
    if (!watchedBody) {
      setPreviewHtml('');
      setPreviewError('');
      return;
    }

    setIsPreviewLoading(true);
    setPreviewError('');

    try {
      const variables = watchedVariables.reduce((acc, variable) => {
        if (variable?.name) {
          const value = previewData[variable.name] ?? variable.defaultValue ?? '';
          switch (variable.type as VariableType) {
            case 'number':
              acc[variable.name] = Number(value);
              break;
            case 'boolean':
              acc[variable.name] = value === true || value === 'true';
              break;
            default:
              acc[variable.name] = String(value);
          }
        }
        return acc;
      }, {} as Record<string, unknown>);

      const result = await generateEmail('INTERNAL',{
        subject: getValues('subject') || 'Preview',
        body: watchedBody,
        variables,
        department: 'IT',
        product: 'Email Management System',
        actionType: 'INFO',
        description: 'Preview of template',
      });

      if (result.body) {
        setPreviewHtml(result.body);
      } else {
        throw new Error('No HTML content returned from template');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
      setPreviewError(`Preview error: ${errorMessage}`);
      setPreviewHtml('');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const addVariable = () => {
    const newVar: TemplateVariable = {
      name: `variable_${Date.now()}`,
      description: '',
      type: 'text',
      required: false,
      options: [],
    } as any;
    setValue('variables', [...(getValues('variables') ?? []), newVar], { shouldDirty: true });
  };

  const removeVariable = (index: number) => {
    const current = [...(getValues('variables') ?? [])];
    current.splice(index, 1);
    setValue('variables', current, { shouldDirty: true });
  };

  const updateVariable = (index: number, field: keyof TemplateVariable, value: any) => {
    const current = [...(getValues('variables') ?? [])];
    current[index] = { ...current[index], [field]: value };
    setValue('variables', current, { shouldDirty: true });
  };

  const addOption = (varIndex: number) => {
    const current = [...(getValues('variables') ?? [])];
    const opts = current[varIndex].options ?? [];
    current[varIndex] = {
      ...current[varIndex],
      options: [
        ...opts,
        { label: `Option ${opts.length + 1}`, value: `option${opts.length + 1}` },
      ],
    };
    setValue('variables', current, { shouldDirty: true });
  };

  const updateOption = (
    varIndex: number,
    optIndex: number,
    field: 'label' | 'value',
    value: string,
  ) => {
    const current = [...(getValues('variables') ?? [])];
    const opts = [...(current[varIndex].options ?? [])];
    opts[optIndex] = { ...opts[optIndex], [field]: value };
    current[varIndex] = { ...current[varIndex], options: opts };
    setValue('variables', current, { shouldDirty: true });
  };

  const removeOption = (varIndex: number, optIndex: number) => {
    const current = [...(getValues('variables') ?? [])];
    const opts = [...(current[varIndex].options ?? [])];
    opts.splice(optIndex, 1);
    current[varIndex] = { ...current[varIndex], options: opts };
    setValue('variables', current, { shouldDirty: true });
  };

  const onSubmit = async (formData: TemplateFormValues) => {
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const validated = await templateSchema.safeParseAsync(formData);
      if (!validated.success) {
        const errorMessages = validated.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n');
        throw new Error(`Validation failed:\n${errorMessages}`);
      }

      const templateData: Omit<
        EmailTemplate,
        'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy'
      > & { createdBy: string } = {
        name: validated.data.name,
        description: validated.data.description || '',
        category: validated.data.category,
        subject: validated.data.subject,
        body: validated.data.body,
        variables: validated.data.variables.map((v) => ({
          name: v.name,
          description: v.description || '',
          type: v.type as VariableType,
          required: Boolean(v.required),
          defaultValue: v.defaultValue,
          options: v.options || [],
        })),
        tags: validated.data.tags || [],
        isActive: validated.data.isActive !== false,
        createdBy: 'current-user-id', // TODO: replace from auth
      };

      let result: EmailTemplate;
      if (template) {
        result = await templateAPI.updateTemplate(template.id, templateData);
        toast.success('Template updated successfully');
      } else {
        result = await templateAPI.createTemplate(templateData);
        toast.success('Template created successfully');
      }

      const savedTemplate: EmailTemplate = {
        ...templateData,
        ...result,
        id: result.id || '',
        version: result.version || 1,
        createdAt: result.createdAt || new Date().toISOString(),
        updatedAt: result.updatedAt || new Date().toISOString(),
        createdBy: result.createdBy || 'current-user-id',
      };

      onSave?.(savedTemplate);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred';
      setSubmitError(msg);

      if (msg.includes('Validation failed')) {
        toast.error('Please fix the following issues:', {
          description: msg,
          duration: 10000,
        });
      } else {
        toast.error(`Failed to save template: ${msg}`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePreviewDataChange = (varName: string, value: string | boolean) => {
    setPreviewData((prev) => ({
      ...prev,
      [varName]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{template ? 'Edit Template' : 'Create New Template'}</h2>
          <p className="text-muted-foreground">
            {template ? 'Update your email template' : 'Create a new email template with custom variables and styling'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
            disabled={submitLoading || isSubmittingProp}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" disabled={submitLoading || isSubmittingProp}>
            {submitLoading ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input id="name" placeholder="e.g. Welcome Email" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief description" {...register('description')} />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} id="isActive" />
                    )}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {getValues('isActive')
                    ? 'This template is active and can be used'
                    : "This template is inactive and won't be available"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Template Variables</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variable
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedVariables?.length ? (
                <div className="space-y-4">
                  {watchedVariables.map((variable, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <span className="font-mono text-sm">{`{{${variable.name}}}`}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeVariable(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label>Variable Name</Label>
                            <Input
                              value={variable.name}
                              onChange={(e) => updateVariable(index, 'name', e.target.value)}
                              placeholder="e.g., username"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Type</Label>
                            <Select
                              value={variable.type as string}
                              onValueChange={(v) => updateVariable(index, 'type', v as VariableType)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="boolean">Yes/No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label>Description</Label>
                          <Input
                            value={variable.description || ''}
                            onChange={(e) => updateVariable(index, 'description', e.target.value)}
                            placeholder="What's this variable for?"
                          />
                        </div>

                        {variable.type === 'select' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Options</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(index)}
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Add Option
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {(variable.options ?? []).length ? (
                                variable.options!.map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2">
                                    <Input
                                      value={option.label}
                                      onChange={(e) =>
                                        updateOption(index, optIndex, 'label', e.target.value)
                                      }
                                      placeholder="Label"
                                      className="flex-1"
                                    />
                                    <Input
                                      value={option.value}
                                      onChange={(e) =>
                                        updateOption(index, optIndex, 'value', e.target.value)
                                      }
                                      placeholder="Value"
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10"
                                      onClick={() => removeOption(index, optIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                  No options added yet
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-1">
                            <Label className="text-sm" htmlFor={`var-${index}-required`}>
                              Required
                            </Label>
                            <p className="text-xs text-muted-foreground">Must be provided when using</p>
                          </div>
                          <Switch
                            id={`var-${index}-required`}
                            checked={!!variable.required}
                            onCheckedChange={(checked: boolean) => updateVariable(index, 'required', checked)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No variables added yet.</p>
                  <p className="text-sm">Add variables to make your template dynamic</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input id="subject" placeholder="Email subject" {...register('subject')} />
                  {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="body">Email Body *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
                      >
                        {activeTab === 'editor' ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </>
                        ) : (
                          <>
                            <Code className="mr-2 h-4 w-4" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'preview')} className="w-full">
                    <TabsContent value="editor" className="m-0">
                      <Textarea id="body" className="min-h-[400px] font-mono text-sm" {...register('body')} />
                      {errors.body && <p className="text-sm text-red-500">{errors.body.message}</p>}
                    </TabsContent>
                    <TabsContent value="preview" className="m-0">
                      <div className="border rounded-md p-4 min-h-[400px] overflow-auto">
                        {isPreviewLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <p>Loading preview...</p>
                          </div>
                        ) : previewError ? (
                          <div className="text-red-500 p-4 bg-red-50 rounded">{previewError}</div>
                        ) : (
                          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview data panel */}
          {watchedVariables?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set test values to preview how your template will render
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedVariables.map((variable, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`preview-${variable.name}`}>
                        {variable.name}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <span className="text-xs text-muted-foreground">{`{{${variable.name}}}`}</span>
                    </div>

                    {variable.type === 'select' && (variable.options?.length ?? 0) > 0 ? (
                      <Select
                        onValueChange={(value) => handlePreviewDataChange(variable.name, value)}
                        value={(previewData[variable.name] as string) ?? ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${variable.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options!.map((option, optIndex) => (
                            <SelectItem key={optIndex} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : variable.type === 'boolean' ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`preview-${variable.name}`}
                          checked={!!previewData[variable.name]}
                          onCheckedChange={(checked: boolean) => handlePreviewDataChange(variable.name, checked)}
                        />
                        <Label htmlFor={`preview-${variable.name}`}>
                          {previewData[variable.name] ? 'Yes' : 'No'}
                        </Label>
                      </div>
                    ) : (
                      <Input
                        id={`preview-${variable.name}`}
                        type={variable.type === 'number' ? 'number' : 'text'}
                        placeholder={`Enter ${variable.name}`}
                        value={(previewData[variable.name] as string) ?? ''}
                        onChange={(e) => handlePreviewDataChange(variable.name, e.target.value)}
                      />
                    )}

                    {variable.description && (
                      <p className="text-xs text-muted-foreground">{variable.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={submitLoading || isSubmittingProp}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitLoading || isSubmittingProp}>
          {submitLoading ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {template ? 'Update Template' : 'Create Template'}
            </>
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
