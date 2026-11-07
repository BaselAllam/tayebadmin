import { Eye, ImagePlus, Loader2, MessageSquare, Plus, Search, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, FormDialog, PageHeader, SelectField, StatusPill, SwitchField, TextAreaField, TextField, type Column } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useGetProducts, useGetProductsCategories } from "@/hooks/useSiteData";
import { useSimpleToast } from "@/components/ui/toaster";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMsg";
import { createProducts, createProductsImg, deleteProductsImg, updateProducts, type ProductsModel } from "@/services/ProductsServices";
import { imgUrl } from "@/services/api";

const LOW_STOCK = 5;
const ALL = "all";

const emptyProduct = {
  product_name: "",
  product_name_ar: "",
  product_description: "",
  product_description_ar: "",
  category: "",
  price: "",
  stock_qty: "0",
  is_available: true,
};

const extractError = (e: any, fallback: string) => {
  const errors = e?.response?.data?.data;
  return errors ? Object.values(errors).flat().join(", ") : e?.message || fallback;
};

export default function ProductsPage() {
  const { t } = useI18n();
  const { success, error } = useSimpleToast();
  const { data: products, isLoading, error: isError, refetch } = useGetProducts();
  const { data: categories } = useGetProductsCategories();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const set = (patch: Partial<typeof emptyProduct>) => setForm((f) => ({ ...f, ...patch }));
  const [isCreateUpdateLoading, setIsCreateUpdateLoading] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [deletingImgId, setDeletingImgId] = useState<string | null>(null);

  const editingProduct = products?.find((p) => p.id === editingId);

  const categoryOptions = useMemo(
    () =>
      (categories ?? [])
        .filter((c) => c.is_active || c.id === form.category)
        .map((c) => ({ value: c.id, label: c.category_name })),
    [categories, form.category],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...(products ?? [])]
      .filter((p) => categoryFilter === ALL || p.category?.id === categoryFilter)
      .filter((p) => !q || `${p.product_name} ${p.product_name_ar}`.toLowerCase().includes(q))
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  }, [products, query, categoryFilter]);

  /* ------------------------------------------------------------------ table */

  const columns: Column<ProductsModel>[] = [
    {
      key: "image",
      header: t("field.image"),
      cell: (p) =>
        p.imgs?.length ? (
          <div className="relative size-12">
            <img src={`${imgUrl}${p.imgs[0].image_url}`} alt="" className="size-12 rounded-md border object-cover" />
            {p.imgs.length > 1 && (
              <span className="absolute -bottom-1 -end-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                +{p.imgs.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div className="flex size-12 items-center justify-center rounded-md border border-dashed text-muted-foreground">
            <ImagePlus className="size-4" />
          </div>
        ),
    },
    {
      key: "name",
      header: t("field.productName"),
      cell: (p) => (
        <div className="min-w-0 max-w-[14rem]">
          <p className="truncate font-medium">{p.product_name}</p>
          <p className="truncate text-xs text-muted-foreground">{p.product_name_ar}</p>
        </div>
      ),
    },
    { key: "category", header: t("field.category"), cell: (p) => p.category?.category_name ?? "—" },
    { key: "price", header: t("field.price"), cell: (p) => <span className="font-medium">{Number(p.price).toLocaleString()}</span> },
    {
      key: "stock",
      header: t("field.stockQty"),
      cell: (p) =>
        p.stock_qty <= 0 ? (
          <StatusPill label={t("products.outOfStock")} tone="danger" />
        ) : p.stock_qty <= LOW_STOCK ? (
          <StatusPill label={`${t("products.lowStock")} · ${p.stock_qty}`} tone="warning" />
        ) : (
          p.stock_qty
        ),
    },
    {
      key: "stats",
      header: t("products.stats"),
      cell: (p) => (
        <div className="flex items-center gap-3 whitespace-nowrap text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1" title={t("field.viewsCounter")}><Eye className="size-3.5" />{p.views_counter}</span>
          <span className="inline-flex items-center gap-1" title={t("field.ordersCounter")}><ShoppingCart className="size-3.5" />{p.orders_counter}</span>
          <span className="inline-flex items-center gap-1" title={t("field.reviewsCounter")}><MessageSquare className="size-3.5" />{p.reviews_counter}</span>
        </div>
      ),
    },
    {
      key: "available",
      header: t("common.status"),
      cell: (p) => (
        <StatusPill
          label={p.is_available ? t("products.available") : t("products.unavailable")}
          tone={p.is_available ? "success" : "neutral"}
        />
      ),
    },
  ];

  /* --------------------------------------------------------- product save */

  const handleCreate = async () => {
    if (!form.product_name.trim() || !form.category) return error(t("products.requiredFields"));
    setIsCreateUpdateLoading(true);
    try {
      const res = await createProducts({
        ...form,
        price: Number(form.price) || 0,
        stock_qty: Number(form.stock_qty) || 0,
        views_counter: 0,
        orders_counter: 0,
        reviews_counter: 0,
      });
      if (res.status === 201) {
        const newId = res.data?.data?.id ?? res.data?.id;
        await refetch();
        if (newId) {
          setEditingId(newId);
          success(t("products.createdAddImages"));
        } else {
          success(t("common.saved"));
          setOpen(false);
        }
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editingProduct) return;
    if (!form.product_name.trim() || !form.category) return error(t("products.requiredFields"));
    setIsCreateUpdateLoading(true);

    const p = editingProduct;
    const formData = new FormData();
    formData.append("id", editingId);
    if (form.product_name !== p.product_name) formData.append("product_name", form.product_name);
    if (form.product_name_ar !== p.product_name_ar) formData.append("product_name_ar", form.product_name_ar);
    if (form.product_description !== (p.product_description ?? "")) formData.append("product_description", form.product_description);
    if (form.product_description_ar !== (p.product_description_ar ?? "")) formData.append("product_description_ar", form.product_description_ar);
    if (form.category !== p.category?.id) formData.append("category", form.category);
    if (Number(form.price) !== Number(p.price)) formData.append("price", String(Number(form.price) || 0));
    if (Number(form.stock_qty) !== Number(p.stock_qty)) formData.append("stock_qty", String(Number(form.stock_qty) || 0));
    if (form.is_available !== p.is_available) formData.append("is_available", String(form.is_available));

    try {
      const res = await updateProducts(formData);
      if (res.status === 200) {
        await refetch();
        success(t("common.saved"));
        setOpen(false);
      }
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setIsCreateUpdateLoading(false);
    }
  };

  /* -------------------------------------------------------------- images */

  const handleUploadImages = async (files: File[]) => {
    if (!files.length || !editingId) return;
    setIsUploading(true);
    let uploaded = 0;
    for (const file of files) {
      try {
        await createProductsImg({ product_id: editingId, image: file });
        uploaded++;
      } catch (e) {
        error(extractError(e, t("someThingWentWrong")));
      }
    }
    if (uploaded) {
      await refetch();
      success(t("products.imagesAdded"));
    }
    setIsUploading(false);
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!window.confirm(t("products.confirmDeleteImage"))) return;
    setDeletingImgId(imgId);
    try {
      await deleteProductsImg(imgId);
      await refetch();
      success(t("products.imageDeleted"));
    } catch (e) {
      error(extractError(e, t("someThingWentWrong")));
    } finally {
      setDeletingImgId(null);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setOpen(true);
  };

  const openEdit = (p: ProductsModel) => {
    setEditingId(p.id);
    setForm({
      product_name: p.product_name ?? "",
      product_name_ar: p.product_name_ar ?? "",
      product_description: p.product_description ?? "",
      product_description_ar: p.product_description_ar ?? "",
      category: p.category?.id ?? "",
      price: String(p.price ?? ""),
      stock_qty: String(p.stock_qty ?? 0),
      is_available: p.is_available,
    });
    setOpen(true);
  };

  /* ---------------------------------------------------------------- render */

  return (
    <>
      <PageHeader
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        action={
          <Button className="gap-2" disabled={isCreateUpdateLoading} onClick={openCreate}>
            <Plus className="size-4" />
            {isCreateUpdateLoading ? t("loading") : t("products.create")}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-2.5 size-4 text-muted-foreground start-3" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("action.search")} className="ps-9" />
        </div>
        <div className="w-full sm:w-60">
          <SelectField
            label=""
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: ALL, label: t("products.allCategories") },
              ...(categories ?? []).map((c) => ({ value: c.id, label: c.category_name })),
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorMessage />
      ) : (
        <DataTable columns={columns} rows={rows} onEdit={openEdit} />
      )}

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        isLoading={isCreateUpdateLoading}
        wide
        title={editingId ? `${t("products.edit")} — ${editingProduct?.product_name ?? ""}` : t("products.create")}
        onSubmit={() => {
          if (editingId) handleUpdate();
          else handleCreate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <h4 className="text-sm font-semibold sm:col-span-2">{t("products.sectionDetails")}</h4>
          <TextField label={t("field.productName")} value={form.product_name} onChange={(v) => set({ product_name: v })} />
          <TextField label={t("field.productNameAr")} value={form.product_name_ar} onChange={(v) => set({ product_name_ar: v })} />
          <TextAreaField label={t("field.productDescription")} value={form.product_description} onChange={(v) => set({ product_description: v })} rows={3} />
          <TextAreaField label={t("field.productDescriptionAr")} value={form.product_description_ar} onChange={(v) => set({ product_description_ar: v })} rows={3} />

          <h4 className="pt-2 text-sm font-semibold sm:col-span-2">{t("products.sectionPricing")}</h4>
          <SelectField label={t("field.category")} value={form.category} onChange={(v) => set({ category: v })} options={categoryOptions} />
          <TextField label={t("field.price")} type="number" value={form.price} onChange={(v) => set({ price: v })} />
          <TextField label={t("field.stockQty")} type="number" value={form.stock_qty} onChange={(v) => set({ stock_qty: v })} />
          <div className="flex items-end">
            <SwitchField label={t("products.available")} checked={form.is_available} onChange={(v) => set({ is_available: v })} />
          </div>

          {/* ---- images: own endpoints, applied instantly ---- */}
          <div className="space-y-2 pt-2 sm:col-span-2">
            <div>
              <Label className="text-sm font-semibold">{t("products.sectionImages")}</Label>
              <p className="text-xs text-muted-foreground">
                {editingId ? t("products.imagesHint") : t("products.saveFirstHint")}
              </p>
            </div>

            {editingId && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {editingProduct?.imgs?.map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                    <img src={`${imgUrl}${img.image_url}`} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label={t("products.deleteImage")}
                      disabled={deletingImgId === img.id}
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute end-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-destructive shadow hover:bg-destructive hover:text-destructive-foreground disabled:opacity-60"
                    >
                      {deletingImgId === img.id ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
                    </button>
                  </div>
                ))}

                <label
                  className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center text-xs text-muted-foreground transition-colors hover:bg-muted/50 ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      handleUploadImages(files);
                    }}
                  />
                  {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                  {isUploading ? t("products.uploading") : t("products.addImages")}
                </label>
              </div>
            )}
          </div>
        </div>
      </FormDialog>
    </>
  );
}