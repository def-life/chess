type LayoutProps = {
    children: React.ReactNode
}


function Layout(props: LayoutProps) {
    const { children } = props
    return (
        <div className='container mx-auto md:grid md:grid-cols-6 mt-4'>
            {children}
        </div>
    )
}

export default Layout