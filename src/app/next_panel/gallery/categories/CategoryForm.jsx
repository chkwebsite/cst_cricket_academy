"use client";

const emptyCategory = {
    category_name: "",
    slug: "",
    description: "",
    featured_image: "",
    sort_order: 0,
    status: 1,
};

export function getEmptyCategory() {
    return { ...emptyCategory };
}

export function slugify(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function categoryToFormValues(category) {
    return {
        category_name: category.category_name || "",
        slug: category.slug || "",
        description: category.description || "",
        featured_image: category.featured_image || "",
        sort_order: category.sort_order ?? 0,
        status: category.status ?? 1,
    };
}

export function normalizeCategoryPayload(values, createdBy) {
    return {
        category_name: values.category_name.trim(),
        slug: (values.slug || slugify(values.category_name)).trim(),
        description: values.description.trim(),
        featured_image: values.featured_image.trim(),
        sort_order: Number(values.sort_order) || 0,
        status: Number(values.status),
        created_by: createdBy || null,
    };
}

export default function CategoryForm({ formId, values, onChange, onSubmit, error, loading = false }) {
    const handleChange = (field) => (event) => {
        const numericFields = ["sort_order", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        const next = { ...values, [field]: value };

        if (field === "category_name" && !values.slug) {
            next.slug = slugify(event.target.value);
        }

        onChange(next);
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Category Name</label>
                    <input
                        className="form-control"
                        value={values.category_name}
                        onChange={handleChange("category_name")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Slug</label>
                    <input
                        className="form-control"
                        value={values.slug}
                        onChange={handleChange("slug")}
                        placeholder="auto-generated-from-name"
                        disabled={loading}
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={values.description}
                        onChange={handleChange("description")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Featured Image URL</label>
                    <input
                        type="text"
                        className="form-control"
                        value={values.featured_image}
                        onChange={handleChange("featured_image")}
                        placeholder="/uploads/gallery/categories/example.jpg"
                        disabled={loading}
                    />
                    {values.featured_image && (
                        <img
                            src={values.featured_image}
                            alt="preview"
                            className="mt-2 rounded-3 border"
                            style={{ height: 80, objectFit: "cover" }}
                        />
                    )}
                </div>

                <div className="col-md-3">
                    <label className="form-label">Sort Order</label>
                    <input
                        type="number"
                        className="form-control"
                        value={values.sort_order}
                        onChange={handleChange("sort_order")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select
                        className="form-select"
                        value={values.status}
                        onChange={handleChange("status")}
                        disabled={loading}
                    >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>
            </div>
        </form>
    );
}
