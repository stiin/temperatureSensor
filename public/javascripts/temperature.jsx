var Navbar = ReactBootstrap.Navbar;
var NavItem = ReactBootstrap.NavItem;
var NavDropdown = ReactBootstrap.NavDropdown;
var MenuItem = ReactBootstrap.MenuItem;
var Nav = ReactBootstrap.Nav;
var Glyphicon = ReactBootstrap.Glyphicon;
var FormGroup = ReactBootstrap.FormGroup;
var ControlLabel = ReactBootstrap.ControlLabel;
var FormControl = ReactBootstrap.FormControl;
var HelpBlock = ReactBootstrap.HelpBlock;
var Form = ReactBootstrap.Form;
var Button = ReactBootstrap.Button;
var Col = ReactBootstrap.Col;
var Checkbox = ReactBootstrap.Checkbox;
var Radio = ReactBootstrap.Radio;


function Header(props) {
    return (
        <div className="header">
            <h1>{props.title}</h1>
        </div>
    )
}

function Footer(props) {
    return (
        <div className="footer">
            <h1>{props.title}</h1>
        </div>
    )
}

function TempData(props) {
    return (
        <div className="dispTempData">
            <div className="tempText">Temperature</div>
            <div className="tempData">{props.currentTemp} °C</div>
        </div>
    )
}

TempData.propTypes = {
    currentTemp: React.PropTypes.number
};

function TimeData(props) {
    return (
        <div className="dispTimeData">
            <div className="timeText">Last reading</div>
            <div className="timeData">{props.createdAt}</div>
        </div>
    )
}

TimeData.propTypes = {
    createdAt: React.PropTypes.string
};


function DispTempData(props) {
    return (
        <div className="tempBoard">
            <Header />
            <TempData currentTemp={props.tempData.currentTemp}/>
            <TimeData createdAt={props.tempData.createdAt}/>
            <Footer />
        </div>
    );
}

DispTempData.propTypes = {
    currentTemp: React.PropTypes.number,
    createdAt: React.PropTypes.string
};

//////////////////////////////////////
// NAVBAR

const onClickSettings = function(event){
    settings();
};

const onClickLocation = function(event){
    location();
};

function NavbarDisp(props) {
    return(
        <div>
            <Navbar inverse>
                <Navbar.Header className="navHeader">
                    <Navbar.Brand>
                        <a href="#">Stiin</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1} href="#"><Glyphicon glyph="user" /> &nbsp;My Account</NavItem>
                        <NavItem eventKey={2} onClick={onClickLocation} href="#"><Glyphicon glyph="map-marker" /> &nbsp;Location</NavItem>
                        <NavDropdown eventKey={3} title={<span><Glyphicon glyph="stats" />  &nbsp;Charts</span>} id="basic-nav-dropdown">
                            <MenuItem eventKey={3.1}>Action</MenuItem>
                            <MenuItem eventKey={3.2}>Another action</MenuItem>
                            <MenuItem eventKey={3.3}>Something else here</MenuItem>
                            <MenuItem divider />
                            <MenuItem eventKey={3.4}>Separated link</MenuItem>
                        </NavDropdown>
                        <NavItem eventKey={4} href="#"><Glyphicon glyph="tree-conifer" /> &nbsp;Geofences</NavItem>
                    </Nav>
                    <Nav pullRight>
                        <NavItem eventKey={5} onClick={onClickSettings}><Glyphicon glyph="cog" />  &nbsp;Settings</NavItem>
                        <NavItem eventKey={6} href="#"><Glyphicon glyph="question-sign" /> &nbsp;Help & FAQ</NavItem>
                        <NavItem eventKey={7} href="#"><Glyphicon glyph="log-out" /> &nbsp;Sign out</NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
}


//////////////////////////////////////
// SETTINGS

function FieldGroup({ id, label, help, ...props}) {
    return (
        <FormGroup controlId={id}>
            <ControlLabel>{label}</ControlLabel>
            <FormControl {...props}/>
      {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
    );
}

function SwitchButton(props) {
    return (
        <div>
            <input type="checkbox" name="my-checkbox" id={props.id} />
        </div>
    )
}

function MyTempSettingsForm(props) {

    return (
        <div>
            <div className="form-group" id={props.id + "Group"}>
                <label className="control-label">{props.label}</label>
                <span id={props.id + "Feedback"}></span>

                <div className="row">
                    <div className="col-lg-10 col-md-10 col-sm-10 col-xs-7">
                        <input type={props.type} className="form-control" id={props.id} placeholder={props.placeholder} />
                    </div>

                    <div className="col-lg-2 col-md-2 col-sm-2 col-xs-5">
                        <div className="pull-right">
                            <SwitchButton id={props.switchButtonId} checked readOnly inline></SwitchButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HelpButton() {
    return (
        <div style={{overflow:"auto"}}>
            <a tabIndex="0" className="btn btn-md btn-default pull-right" name="my-popover" data-trigger="focus" rel="popover" role="button"  data-placement="top"
                title="Maximum measurable temperature: 125 °C. Minimum measurable temperature: -55 °C.">Help</a>
        </div>
    );
}

const getValidationState = function(event){
    const length = state.value.length;
    if (length > 10) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
};

const formInstance = (
    <div>
        <span className='settingsTitle'>SETTINGS</span>
        <div id="settingsOutline">
            <div id="settingsForm">
                <form>
                    <span id="settingsInfo">Product information</span>
                    <hr />
                    <FieldGroup readOnly
                        id="formControlsProductID"
                        type="ProductID"
                        label="Product ID"

                    />
                    <FieldGroup
                        id="formControlsProductAlias"
                        type="ProductAlias"
                        label="Product alias"
                        placeholder="Enter product alias"
                    />
                    <br />
                    <span id="settingsInfo">Temperature settings</span>
                    <hr />
                    <span id="settingsInfoDetails">Alarm</span><br/><br/>
                    <MyTempSettingsForm id={"formControlsMaxAlarm"} switchButtonId={"max_temp_alarm"} label={"Maximum temperature limit"} type={"maxAlarm"} placeholder={"Max T (°C)"} />
                    <MyTempSettingsForm id={"formControlsMinAlarm"} switchButtonId={"min_temp_alarm"} label={"Minimum temperature limit"} type={"minAlarm"} placeholder={"Min T (°C)"} />
                    <span id="settingsInfoDetails">Comfort zone interval</span><br/><br/>
                    <MyTempSettingsForm id={"formControlsMaxComfort"} switchButtonId={"max_temp_comfort"} label={"Maximum comfort temperature"} type={"maxComfort"} placeholder={"Max T (°C)"} />
                    <MyTempSettingsForm id={"formControlsMinComfort"} switchButtonId={"min_temp_comfort"} label={"Minimum comfort temperature"} type={"minComfort"} placeholder={"Min T (°C)"} />
                    <HelpButton />
                </form>
            </div>
        </div>
    </div>
);

/*
ReactDOM.render(formInstance, document.getElementById('settingsForm'));
*/
