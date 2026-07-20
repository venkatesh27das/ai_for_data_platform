import { CalendarDays, Maximize, Package, ScanSearch, UserRound, ZoomIn, ZoomOut } from 'lucide-react'

const entities = [
  { name: 'DimCustomer', icon: UserRound, className: 'customer', fields: ['PK  CustomerKey (INT)', 'CustomerID (STRING)', 'CustomerName (STRING)', 'CustomerSegment (STRING)', 'City (STRING)', 'Country (STRING)'] },
  { name: 'FactSalesOrderLine', icon: ScanSearch, className: 'fact', fields: ['PK, FK  OrderLineKey (INT)', 'FK  OrderKey (INT)', 'FK  CustomerKey (INT)', 'FK  ProductKey (INT)', 'FK  DateKey (INT)', 'Quantity (DECIMAL)', 'NetAmount (DECIMAL)'] },
  { name: 'DimProduct', icon: Package, className: 'product', fields: ['PK  ProductKey (INT)', 'ProductID (STRING)', 'ProductName (STRING)', 'ProductCategory (STRING)', 'SubCategory (STRING)', 'Brand (STRING)'] },
  { name: 'DimDate', icon: CalendarDays, className: 'date', fields: ['PK  DateKey (INT)', 'FullDate (DATE)', 'Month (INT)', 'MonthName (STRING)', 'Quarter (INT)', 'Year (INT)'] },
]

export function ModelCanvas() {
  return (
    <div className="artifact-panel">
      <div className="artifact-header"><div><h2>Logical Model</h2><span>v1 (Preview)</span></div><div className="artifact-tabs"><button className="active">▦ Diagram</button><button>◔ Details</button><button>⚙ Properties</button></div></div>
      <div className="model-canvas">
        <div className="canvas-tools"><button><ZoomIn size={17} /></button><button><ZoomOut size={17} /></button><span>100%</span><button><Maximize size={17} /></button></div>
        <svg className="relationships" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true"><path d="M290 190 C390 190 350 320 465 320" /><path d="M760 190 C640 190 690 320 585 320" /><path d="M290 500 C420 500 350 390 465 390" /></svg>
        {entities.map(({ name, icon: Icon, className, fields }) => <div key={name} className={`entity-card entity-${className}`}><header><Icon size={17} /><strong>{name}</strong></header><ul>{fields.map((field, index) => <li key={field} className={index === 0 ? 'key-field' : ''}>{field}</li>)}</ul><footer>…</footer></div>)}
        <div className="canvas-empty-copy"><Sparkle />Model artefacts will appear here as later workflow stages are implemented.</div>
      </div>
      <div className="status-strip"><Stat value="4" label="Entities" /><Stat value="0" label="Mappings" /><Stat value="0" label="DQ Rules" /><Stat value="0" label="Need review" /><span className="last-activity"><i /> Last activity: Conversation updated</span></div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) { return <div className="strip-stat"><strong>{value}</strong><small>{label}</small></div> }
function Sparkle() { return <span>✦</span> }

