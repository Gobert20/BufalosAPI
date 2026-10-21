using BufalosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BufalosAPI.Data
{
    public class BufalosDbContext : DbContext
    {
        public BufalosDbContext(DbContextOptions<BufalosDbContext> options) : base(options) { }

        public DbSet<Rol> Roles { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallePedidos { get; set; }
        public DbSet<TipoServicio> TiposServicio { get; set; }
        public DbSet<OrdenServicio> OrdenesServicio { get; set; }
        public DbSet<PermisoUsuario> PermisosUsuarios { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<ProveedorProducto> ProveedoresProductos { get; set; }
        public DbSet<DetalleParcheCustom> DetallesParchesCustom { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapeo TB_Roles
            modelBuilder.Entity<Rol>(e =>
            {
                e.ToTable("TB_Roles");
                e.HasKey(r => r.Id_Rol);
            });

            // Mapeo TB_Usuarios
            modelBuilder.Entity<Usuario>(e =>
            {
                e.ToTable("TB_Usuarios");
                e.HasKey(u => u.Id_Usuario);
                e.HasOne(u => u.Rol).WithMany().HasForeignKey(u => u.Id_Rol);
            });

            // Mapeo TB_PermisosUsuarios
            modelBuilder.Entity<PermisoUsuario>(e =>
            {
                e.ToTable("TB_PermisosUsuarios");
                e.HasKey(p => p.Id_Permiso);
                e.HasOne(p => p.Usuario).WithMany().HasForeignKey(p => p.Id_Usuario).OnDelete(DeleteBehavior.Cascade);
            });

            // Mapeo TB_Proveedores
            modelBuilder.Entity<Proveedor>(e =>
            {
                e.ToTable("TB_Proveedores");
                e.HasKey(p => p.Id_Proveedor);
            });

            // Mapeo TB_Categorias
            modelBuilder.Entity<Categoria>(e =>
            {
                e.ToTable("TB_Categorias");
                e.HasKey(c => c.Id_Categoria);
            });

            // Mapeo TB_Productos
            modelBuilder.Entity<Producto>(e =>
            {
                e.ToTable("TB_Productos");
                e.HasKey(p => p.Id_Producto);
                e.Property(p => p.Precio).HasColumnType("decimal(10,2)");
                e.Property(p => p.ImagenUrl).HasMaxLength(500).IsRequired(false);
                e.HasOne(p => p.Categoria).WithMany().HasForeignKey(p => p.Id_Categoria);
            });

            // Mapeo TB_ProveedoresProductos
            modelBuilder.Entity<ProveedorProducto>(e =>
            {
                e.ToTable("TB_ProveedoresProductos");
                e.HasKey(pp => new { pp.Id_Proveedor, pp.Id_Producto });
                e.HasOne(pp => pp.Proveedor).WithMany(p => p.ProveedoresProductos).HasForeignKey(pp => pp.Id_Proveedor);
                e.HasOne(pp => pp.Producto).WithMany().HasForeignKey(pp => pp.Id_Producto).OnDelete(DeleteBehavior.Cascade);
            });

            // Mapeo TB_Pedidos
            modelBuilder.Entity<Pedido>(e =>
            {
                e.ToTable("TB_Pedidos");
                e.HasKey(p => p.Id_Pedido);
                e.Property(p => p.Total).HasColumnType("decimal(10,2)");
                e.HasOne(p => p.Usuario).WithMany().HasForeignKey(p => p.Id_Usuario);
            });

            // Mapeo TB_DetallePedidos
            modelBuilder.Entity<DetallePedido>(e =>
            {
                e.ToTable("TB_DetallePedidos");
                e.HasKey(d => d.Id_DetallePedido);
                e.Property(d => d.PrecioUnitario).HasColumnType("decimal(10,2)");
                e.HasOne<Pedido>().WithMany(p => p.Detalles).HasForeignKey(d => d.Id_Pedido);
                e.HasOne(d => d.Producto).WithMany().HasForeignKey(d => d.Id_Producto);
            });

            // Mapeo TB_TiposServicio
            modelBuilder.Entity<TipoServicio>(e =>
            {
                e.ToTable("TB_TiposServicio");
                e.HasKey(t => t.Id_TipoServicio);
                e.Property(t => t.CostoBase).HasColumnType("decimal(10,2)");
            });

            // Mapeo TB_OrdenesServicio
            modelBuilder.Entity<OrdenServicio>(e =>
            {
                e.ToTable("TB_OrdenesServicio");
                e.HasKey(o => o.Id_OrdenServicio);
                e.Property(o => o.CostoTotal).HasColumnType("decimal(10,2)");
                e.HasOne(o => o.Cliente).WithMany().HasForeignKey(o => o.Id_Cliente);
                e.HasOne(o => o.TecnicoAsignado).WithMany().HasForeignKey(o => o.Id_TecnicoAsignado).IsRequired(false);
                e.HasOne(o => o.TipoServicio).WithMany().HasForeignKey(o => o.Id_TipoServicio);
            });

            // Mapeo TB_DetallesParchesCustom
            modelBuilder.Entity<DetalleParcheCustom>(e =>
            {
                e.ToTable("TB_DetallesParchesCustom");
                e.HasKey(d => d.Id_DetalleParche);
                e.HasOne(d => d.OrdenServicio).WithMany().HasForeignKey(d => d.Id_OrdenServicio).OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
